import { promises as fs } from 'fs';


class Utils {

  static async sleep(tag, timeSeconds){
    for (let i=0; i != timeSeconds; i++){
      await new Promise(resolve => setTimeout(resolve, 1000));
    }
  }

  static makeNextURL(startURL, nextURL) {
    if (nextURL.substring(0,1) == 'h') {
      // An absolute URL
      return nextURL;
    }

    if (nextURL.substring(0,1) == '/') {
      // An relative URL
      return (new URL(nextURL, startURL)).href;
    }

    throw new Error(`makeNextURL is stuck. ${startURL} ${nextURL}`);

  }

  static async readJson(path) {
    try {
      return JSON.parse(
        await fs.readFile(path, {encoding: 'utf8'})
      );
    } catch (error){
        console.error(error);
    }
  }

}

export {
  Utils,
};

export default Utils;