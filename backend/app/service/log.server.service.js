'use strict';

class LogService {
    constructor() { }

    async saveLog(model) {
        return new Promise((resolve, reject) => {
            model.save().then((doc) => {
                resolve(doc)
            }, error => {
                reject(error)
            })
        })
    }
}

module.exports = LogService;
