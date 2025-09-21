import axios from "axios";
import { RandomnessProvider, RandomnessResult } from "../types.js";

/**
 * Random.org Provider
 *
 * Uses the Random.org API for atmospheric noise-based true randomness.
 * This is the original provider from the coin-flip-mcp server.
 */
export class RandomOrgProvider implements RandomnessProvider {
  readonly name = "Random.org";
  readonly description = "True randomness from atmospheric noise via Random.org API";

  private readonly baseUrl = "https://www.random.org";

  async isAvailable(): Promise<boolean> {
    try {
      const response = await axios.get(`${this.baseUrl}/integers/`, {
        params: {
          num: 1,
          min: 1,
          max: 2,
          col: 1,
          base: 10,
          format: 'plain',
          rnd: 'new'
        },
        timeout: 5000 // 5 second timeout for availability check
      });
      return response.status === 200;
    } catch (error) {
      return false;
    }
  }

  async generateRandomInteger(min: number, max: number): Promise<RandomnessResult> {
    try {
      const response = await axios.get(`${this.baseUrl}/integers/`, {
        params: {
          num: 1,
          min,
          max,
          col: 1,
          base: 10,
          format: 'plain',
          rnd: 'new'
        }
      });

      const value = parseInt(response.data.trim());

      if (isNaN(value)) {
        throw new Error(`Invalid response from Random.org: ${response.data}`);
      }

      return {
        value,
        source: this.name,
        metadata: {
          method: "atmospheric_noise"
        }
      };
    } catch (error) {
      throw new Error(`Random.org API error: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  async generateRandomIntegers(count: number, min: number, max: number): Promise<RandomnessResult[]> {
    try {
      const response = await axios.get(`${this.baseUrl}/integers/`, {
        params: {
          num: count,
          min,
          max,
          col: 1,
          base: 10,
          format: 'plain',
          rnd: 'new'
        }
      });

      const values = response.data.trim().split('\n').map((line: string) => parseInt(line.trim()));

      if (values.some((v: number) => isNaN(v))) {
        throw new Error(`Invalid response from Random.org: ${response.data}`);
      }

      return values.map((value: number) => ({
        value,
        source: this.name,
        metadata: {
          method: "atmospheric_noise"
        }
      }));
    } catch (error) {
      throw new Error(`Random.org API error: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }
}