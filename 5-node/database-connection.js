const { MongoClient } = require('mongodb');

class DatabaseConnection {
    constructor(url, databaseName, collection) {
        this.client = new MongoClient(url, { useUnifiedTopology: true });
        this.databaseName = databaseName;
        this.collectionName = collection;
    }

    async connect() {
        try {
            await this.client.connect();
            this.db = this.client.db(this.databaseName);
            this.collection = this.db.collection(this.collectionName);
        }
        catch (error) {
            console.log(error);
        }
    }

    async recreateData(data) {
        await this.collection.deleteMany();
        await this.collection.insertMany(data);
    }
}

module.exports = DatabaseConnection;
