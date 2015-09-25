var $$ = require("avalon");

module.exports = (
function () {
    var fileConstructor = function (fileInfo, flashEventHub, chunked, chunkSize, blobConstructor) {
        this.name = fileInfo.name;
        this.size = fileInfo.size;
        this.data = fileInfo.data;
        this.modifyTime = fileInfo.modifyTime;
        this.fileLocalToken = fileInfo.fileLocalToken;
        this.__flashfile = fileInfo.__flashfile;
        this.__html5file = fileInfo.__html5file;
        this.status = this.FILE_INIT;
        this.chunked = chunked;
        this.blobs = [];
        this.uploadedPercentage = 0;
        this.flashEventHub = flashEventHub;
        this.doneBlobs = 0;
        if (!chunked)
            chunkSize = this.size;
        // 拆分文件，并构造blob的实例
        var offset = 0;
        var chunkIndex = 0;
        while (offset < this.size) {
            var blob = new blobConstructor(offset, Math.min(chunkSize, this.size - offset), chunkIndex, this);
            blob.addEventListener('blobProgressed', this.onBlobProgressed, this);
            blob.addEventListener('blobUploaded', this.onBlobUploaded, this);
            blob.addEventListener('blobErrored', this.onBlobErrored, this);
            offset += chunkSize;
            this.blobs.push(blob);
            chunkIndex++;
        }
    };
    fileConstructor.prototype.onBlobProgressed = function (blob, uploadedBytes) {
        this.setUploadedPercentage(Math.min(100, this.sumUploadedBytes() / this.size * 100));
    };
    fileConstructor.prototype.setUploadedPercentage = function (percentage, silent) {
        var beforePercentage = this.uploadedPercentage;
        this.uploadedPercentage = Math.round(percentage * 100) / 100;
        if (silent !== true) {
            this.dispatchEvent('fileProgressed', this, beforePercentage);
        }
    };
    fileConstructor.prototype.onBlobUploaded = function (blob, responseText) {
        this.doneBlobs++;
        if (this.doneBlobs != this.blobs.length) {
            this.setUploadedPercentage(Math.min(100, this.sumUploadedBytes() / this.size * 100));
        } else {
            this.setUploadedPercentage(100, true);
            this.setStatus(this.FILE_UPLOADED);
        }
    };
    fileConstructor.prototype.onBlobErrored = function (blob, errorText) {
        this.setStatus(this.FILE_ERROR_FAIL_UPLOAD);
    };
    /*
	 * 遍历所有的Blob，汇总已上传的字节数。
	 */
    fileConstructor.prototype.sumUploadedBytes = function () {
        var bytes = 0;
        for (var i = 0; i < this.blobs.length; i++) {
            bytes += this.blobs[i].uploadedBytes;
        }
        return bytes;
    };
    /*
	 * 修改文件状态，并Fire一个fileStatusChanged事件。
	 * @param status {int} 新的文件状态代码
	 * @param silent {boolean} silent为true时，不触发fileStatusChanged事件。
	 */
    fileConstructor.prototype.setStatus = function (status, silent) {
        var beforeStatus = this.status;
        this.status = status;
        if (silent !== true) {
            this.dispatchEvent('fileStatusChanged', this, beforeStatus);
        }
    };
    /*
	 * 销毁文件对象，包括Flash内的文件引用和所有的blob。
	 */
    fileConstructor.prototype.purge = function () {
        for (var i = 0; i < this.blobs.length; i++) {
            this.blobs[i].purge();
        }
        this.blobs.length = 0;
        // Purge FLASH FileReference
        if (!!this.flashEventHub && this.__flashfile) {
            this.flashEventHub.sendFlashMessage('removeCacheFileByToken', this.fileLocalToken);
        }
    };
    /*
	 * 文件状态代码。0-100为正常状态，101以后为错误状态
	 */
    fileConstructor.prototype.FILE_INIT = 0;
    // 原始状态
    fileConstructor.prototype.FILE_CACHED = 1;
    // 已被runtime缓存
    fileConstructor.prototype.FILE_QUEUED = 2;
    // 已进入发送队列
    fileConstructor.prototype.FILE_IN_UPLOADING = 5;
    // 文件已经开始上传
    fileConstructor.prototype.FILE_UPLOADED = 6;
    // 文件上传结束
    fileConstructor.prototype.FILE_ERROR_FAIL_READ = 101;
    // FileQueue无法读取文件
    fileConstructor.prototype.FILE_ERROR_FAIL_UPLOAD = 103;
    // FileQueue发送文件时碰见错误
    return fileConstructor;
}
)();