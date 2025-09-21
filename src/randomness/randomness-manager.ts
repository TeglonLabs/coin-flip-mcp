import { RandomnessProvider, RandomnessResult } from "./types.js";

/**
 * Randomness Manager
 *
 * Manages multiple randomness providers with fallback support.
 * Providers are tried in order until one succeeds.
 */
export class RandomnessManager {
  private providers: RandomnessProvider[] = [];
  private currentProvider: RandomnessProvider | null = null;

  constructor(providers: RandomnessProvider[] = []) {
    this.providers = [...providers];
  }

  /**
   * Add a randomness provider
   */
  addProvider(provider: RandomnessProvider): void {
    this.providers.push(provider);
  }

  /**
   * Get available providers
   */
  async getAvailableProviders(): Promise<RandomnessProvider[]> {
    const availableProviders: RandomnessProvider[] = [];

    for (const provider of this.providers) {
      try {
        if (await provider.isAvailable()) {
          availableProviders.push(provider);
        }
      } catch (error) {
        console.warn(`Provider ${provider.name} availability check failed:`, error);
      }
    }

    return availableProviders;
  }

  /**
   * Get the current active provider
   */
  getCurrentProvider(): RandomnessProvider | null {
    return this.currentProvider;
  }

  /**
   * Generate a random integer using the first available provider
   */
  async generateRandomInteger(min: number, max: number): Promise<RandomnessResult> {
    const availableProviders = await this.getAvailableProviders();

    if (availableProviders.length === 0) {
      throw new Error("No randomness providers are available");
    }

    let lastError: Error | null = null;

    for (const provider of availableProviders) {
      try {
        this.currentProvider = provider;
        const result = await provider.generateRandomInteger(min, max);

        // Add provider info to metadata
        result.metadata = {
          ...result.metadata,
          providerUsed: provider.name
        };

        return result;
      } catch (error) {
        lastError = error instanceof Error ? error : new Error(String(error));
        console.warn(`Provider ${provider.name} failed:`, error);
      }
    }

    throw new Error(`All randomness providers failed. Last error: ${lastError?.message}`);
  }

  /**
   * Generate multiple random integers using the first available provider
   */
  async generateRandomIntegers(count: number, min: number, max: number): Promise<RandomnessResult[]> {
    const availableProviders = await this.getAvailableProviders();

    if (availableProviders.length === 0) {
      throw new Error("No randomness providers are available");
    }

    let lastError: Error | null = null;

    for (const provider of availableProviders) {
      try {
        this.currentProvider = provider;
        const results = await provider.generateRandomIntegers(count, min, max);

        // Add provider info to metadata
        results.forEach(result => {
          result.metadata = {
            ...result.metadata,
            providerUsed: provider.name
          };
        });

        return results;
      } catch (error) {
        lastError = error instanceof Error ? error : new Error(String(error));
        console.warn(`Provider ${provider.name} failed:`, error);
      }
    }

    throw new Error(`All randomness providers failed. Last error: ${lastError?.message}`);
  }

  /**
   * Get information about all configured providers
   */
  async getProvidersInfo(): Promise<Array<{
    name: string;
    description: string;
    available: boolean;
    error?: string;
  }>> {
    const info = [];

    for (const provider of this.providers) {
      try {
        const available = await provider.isAvailable();
        info.push({
          name: provider.name,
          description: provider.description,
          available
        });
      } catch (error) {
        info.push({
          name: provider.name,
          description: provider.description,
          available: false,
          error: error instanceof Error ? error.message : String(error)
        });
      }
    }

    return info;
  }
}