/**
 * Randomness Provider Interface
 *
 * This interface allows the coin flip server to use different randomness sources
 * while maintaining a consistent API.
 */

export interface RandomnessResult {
  /** The random integer result */
  value: number;
  /** Source of randomness for transparency */
  source: string;
  /** Optional metadata about the randomness generation */
  metadata?: {
    /** Transaction hash if from blockchain */
    transactionHash?: string;
    /** Gas used if applicable */
    gasUsed?: number;
    /** Block height/timestamp if applicable */
    blockInfo?: string;
    /** Method used for randomness generation */
    method?: string;
    /** Provider used for randomness generation */
    providerUsed?: string;
  };
}

export interface RandomnessProvider {
  /** Name of the randomness provider */
  readonly name: string;

  /** Description of the randomness source */
  readonly description: string;

  /** Whether this provider is currently available */
  isAvailable(): Promise<boolean>;

  /**
   * Generate a random integer between min and max (inclusive)
   * @param min Minimum value (inclusive)
   * @param max Maximum value (inclusive)
   * @returns Promise resolving to randomness result
   */
  generateRandomInteger(min: number, max: number): Promise<RandomnessResult>;

  /**
   * Generate multiple random integers
   * @param count Number of integers to generate
   * @param min Minimum value (inclusive)
   * @param max Maximum value (inclusive)
   * @returns Promise resolving to array of randomness results
   */
  generateRandomIntegers(count: number, min: number, max: number): Promise<RandomnessResult[]>;
}