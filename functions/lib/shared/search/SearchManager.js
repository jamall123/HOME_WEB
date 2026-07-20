import { DI } from '../di.js';
export class SearchManager {
    activeProvider = null;
    registerProvider(provider) {
        this.activeProvider = provider;
        DI.logger.info(`SearchProvider registered: ${provider.name}`);
    }
    get provider() {
        if (!this.activeProvider) {
            throw new Error('No SearchProvider registered.');
        }
        return this.activeProvider;
    }
    async indexDocument(indexName, id, document) {
        DI.logger.debug(`Indexing document ${id} into ${indexName}`);
        await this.provider.index(indexName, id, document);
    }
    async deleteDocument(indexName, id) {
        DI.logger.debug(`Deleting document ${id} from ${indexName}`);
        await this.provider.delete(indexName, id);
    }
    async search(indexName, query, options) {
        return this.provider.search(indexName, query, options);
    }
}
//# sourceMappingURL=SearchManager.js.map