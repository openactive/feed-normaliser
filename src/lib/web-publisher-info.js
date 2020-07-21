import { database_pool } from './database.js';

class  PublisherInfo {
  static async getInfo(publisherId) {

    const client = await database_pool.connect();

    const publisherSqlQuery = `
     SELECT
        name,
        url
      FROM publisher
      WHERE id=$1 LIMIT 1
    `;

    const publisherFeedsSqlQuery = `
     SELECT
        id as "csFeedId",
        name,
        url
      FROM publisher_feed
      WHERE publisher_id=$1
    `;

    const feedValidationPasses = `
     SELECT
       ROUND(100.0 * (SUM(CASE WHEN validation_passed = TRUE THEN 1 ELSE 0 END)::DECIMAL / COUNT(id)), 1) AS "percentValidationPass"
     FROM raw_data WHERE publisher_feed_id = $1 AND data_deleted = FALSE AND validation_done = TRUE;
    `;

    const feedValidationCompleted = `
     SELECT
       ROUND(100.0 * (SUM(CASE WHEN validation_done = TRUE THEN 1 ELSE 0 END)::DECIMAL / COUNT(id)), 1) AS "percentValidationDone"
     FROM raw_data WHERE publisher_feed_id = $1 AND data_deleted = FALSE;
    `;


    let publisherInfo = {}

    try {
      const resPublisher = await client.query(publisherSqlQuery, [publisherId]);
      const resFeeds = await client.query(publisherFeedsSqlQuery, [publisherId]);

      for(let i in resFeeds.rows){
        const percentValid = await client.query(feedValidationPasses, [resFeeds.rows[i].csFeedId]);
        const percentValidationDone = await client.query(feedValidationCompleted, [resFeeds.rows[i].csFeedId]);

        resFeeds.rows[i].validPercent = Number(percentValid.rows[0].percentValidationPass);
        resFeeds.rows[i].validationDonePercent = Number(percentValidationDone.rows[0].percentValidationDone);
      }

      publisherInfo = resPublisher.rows[0];

      if (publisherInfo){
        publisherInfo.feeds = resFeeds.rows;
      }
    } catch(err){
      console.warn(err);
      publisherInfo = false;
    } finally {
      client.release();
    }

    return publisherInfo;
  }
}

export default PublisherInfo;
