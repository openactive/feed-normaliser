import { database_pool } from './database.js';
import Settings from './settings.js';

class  PublisherFeedStats {
  static async update(publisherId) {

    if (publisherId === undefined){
      throw("publisherId not specified");
    }

    const publisherFeedsSqlQuery = `
     SELECT
        id as "csFeedId",
        name
      FROM publisher_feed
      WHERE publisher_id=$1
      ORDER BY name
    `;

    const feedValidationPassesQuery = `
     SELECT
       ROUND(100.0 * (SUM(CASE WHEN validation_passed = TRUE THEN 1 ELSE 0 END)::DECIMAL / COUNT(id)), 1) AS "percentValidationPass"
     FROM raw_data WHERE publisher_feed_id = $1 AND data_deleted = FALSE AND validation_done = TRUE;
    `;

    const feedValidationCompletedQuery = `
     SELECT
       ROUND(100.0 * (SUM(CASE WHEN validation_done = TRUE THEN 1 ELSE 0 END)::DECIMAL / COUNT(id)), 1) AS "percentValidationDone"
     FROM raw_data WHERE publisher_feed_id = $1 AND data_deleted = FALSE;
    `;

    /* The length of the array in JSONB results is 1 error message per array item */
    const profileStatQuery = `
      SELECT
        normalised_data_profile_results.results as results,
        COUNT(*) as total
       FROM normalised_data_profile_results
         LEFT JOIN normalised_data ON normalised_data_profile_results.normalised_data_id=normalised_data.id
         LEFT JOIN raw_data on normalised_data.raw_data_id = raw_data.id
         LEFT JOIN publisher_feed on raw_data.publisher_feed_id = publisher_feed.id
        WHERE
         normalised_data.data_deleted = FALSE AND
         profile_name = $1 AND
         checked = TRUE AND
         publisher_feed.id = $2
    `;

    const updatePublisherFeedQuery = "UPDATE publisher_feed SET stats=$1 WHERE id=$2";

    const fClient = await database_pool.connect();
    try {
      const resFeeds = await fClient.query(publisherFeedsSqlQuery, [publisherId]);

      for(let i in resFeeds.rows){
        const client = await database_pool.connect();
        console.log(" - " +resFeeds.rows[i].name);

        try {

          let publisherFeedStats = {
            profileStats: [],
            percentValidationDone: 0,
            percentValidationPass: 0,
          };

          let csFeedId = resFeeds.rows[i].csFeedId;


          const percentValid = await client.query(feedValidationPassesQuery, [csFeedId]);
          const percentValidationDone = await client.query(feedValidationCompletedQuery, [csFeedId]);

          publisherFeedStats.percentValidationPass = Number(percentValid.rows[0].percentValidationPass);
          publisherFeedStats.percentValidationDone = Number(percentValidationDone.rows[0].percentValidationDone);

          for(let dataProfileName of Settings.dataProfiles) {
              let profileStat = { dataProfileName: dataProfileName };
              let profileValue = await client.query(profileStatQuery, [dataProfileName, csFeedId]);
              profileStat.score = Number(profileValue.rows[0].score);
              publisherFeedStats.profileStats.push(profileStat);
          }
          /* Finally UPDATE the stats json */
          await client.query(updatePublisherFeedQuery, [publisherFeedStats, csFeedId]);
        } catch (err) {
          console.warn(err);
        } finally {
          client.release();
        }
      }
    } catch(err){
      console.warn(err);
    } finally {
      fClient.release();
    }

  }

  static async updateAll() {
    const client = await database_pool.connect();
    const publisherRes = await client.query("SELECT id, name FROM publisher");

    for (let i in publisherRes.rows){
      console.log("Updating feed stats for "+ publisherRes.rows[i].name);
      await PublisherFeedStats.update(publisherRes.rows[i].id);
    }
  }

}

export default PublisherFeedStats;
