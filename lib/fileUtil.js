const fse = require('fs-extra');
const util = require('util');
const sleep = require('thread-sleep');

 /**
 * File Utils class wraps some of the fs-extra functions with retries and waits for "better" operation on windows
 */
function FileUtil(){
   this.errors = [];
     /**
     * same as fs-extra.emptyDirSync function but retries 3 times with an increasing wait time between retries from 300ms to 900ms
     */
    this.emptyDirSyncSafe = function (path){
      return genricRetry(this.errors, fse.emptyDirSync).call(fse, path);
    };

     /**
     * same as fs-extra.copySnyc function but retries 3 times with an increasing wait time between retries from 300ms to 900ms
     */
    this.copySyncSafe =  function(src, dest, options=undefined){
       return genricRetry(this.errors, fse.copySync).call(fse, src,dest, options);
    };

    /**
     * same as fs-extra.outputFileSync function but retries 3 times with an increasing wait time between retries from 300ms to 900ms
     */
    this.outputFileSyncSafe = function(file, data, options=undefined){
      return genricRetry(this.errors, fse.outputFileSync).call(fse, file, data, options);
    }

    /*
    * returns a string containing the number of caught errors by the utility functons and the error details
    */
    this.getErrorReport = function(){
      var retVal = '';
      retVal = util.format("number of errors caught by fsUtil: %d\n", this.errors.length);
      this.errors.forEach(function (item){
         retVal += util.format("%s\n",item);
      });
      return retVal;
    }
};

/** 
   provides a generic retry function for synchronous functions that retries maxRetries times and waits for msWait * retry between failed tries.
*/
function genricRetry(errReporter, func, maxRetries=3, msWait=300)
{
   return function() {
      for(i=1;i<=maxRetries;i++)
      {
         try{
            console.info("calling %s: try: %d/%d", func.name || 'unknown', i, maxRetries, );
            return func.apply(this, arguments);
         }
         catch(ex)
         {
            lastError = ex;
            var theError = util.format("error calling %s: try: %d/%d, error:%s", func.name || 'unknown' , i, maxRetries, ex);
            if (Array.isArray(err) ){
               err.push(theError);
            }
            console.error(theError);
            console.info("waiting for %sms", msWait*i);
            sleep(msWait*i);
         }
      }

      throw lastError;
   };
}

module.exports = new FileUtil();