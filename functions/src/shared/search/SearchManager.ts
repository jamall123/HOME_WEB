import { DI } from '../di.js';

export interface SearchProvider {
  name: string;
  index(indexName: string, id: string, document: any): Promise<void>;
  delete(indexName: string, id: string): Promise<void>;
  search(indexName: string, query: string, options?: any): Promise<any[]>;
}

export class SearchManager {
  private activeProvider: SearchProvider | null = null;

  registerProvider(provider: SearchProvider) {
    this.activeProvider = provider;
    DI.logger.info(`SearchProvider registered: ${provider.name}`);
  }

  get provider(): SearchProvider {
    if (!this.activeProvider) {
      throw new Error('No SearchProvider registered.');
    }
    return this.activeProvider;
  }

  async indexDocument(indexName: string, id: string, document: any): Promise<void> {
    DI.logger.debug(`Indexing document ${id} into ${indexName}`);
    await this.provider.index(indexName, id, document);
  }

  async deleteDocument(indexName: string, id: string): Promise<void> {
    DI.logger.debug(`Deleting document ${id} from ${indexName}`);
    await this.provider.delete(indexName, id);
  }

  async search(indexName: string, query: string, options?: any): Promise<any[]> {
    return this.provider.search(indexName, query, options);
  }
}
