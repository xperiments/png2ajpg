(function (window) {
    'use strict';
    var CanvasPrototype = window.HTMLCanvasElement && window.HTMLCanvasElement.prototype, hasBlobConstructor = window.Blob && (function () {
        try  {
            return Boolean(new Blob());
        } catch (e) {
            return false;
        }
    }()), hasArrayBufferViewSupport = hasBlobConstructor && window.Uint8Array && (function () {
        try  {
            return new Blob([new Uint8Array(100)]).size === 100;
        } catch (e) {
            return false;
        }
    }()), BlobBuilder = window.BlobBuilder || window.WebKitBlobBuilder || window.MozBlobBuilder || window.MSBlobBuilder, dataURLtoBlob = (hasBlobConstructor || BlobBuilder) && window.atob && window.ArrayBuffer && window.Uint8Array && function (dataURI) {
        var byteString, arrayBuffer, intArray, i, mimeString, bb;
        if (dataURI.split(',')[0].indexOf('base64') >= 0) {
            byteString = atob(dataURI.split(',')[1]);
        } else {
            byteString = decodeURIComponent(dataURI.split(',')[1]);
        }

        arrayBuffer = new ArrayBuffer(byteString.length);
        intArray = new Uint8Array(arrayBuffer);
        for (i = 0; i < byteString.length; i += 1) {
            intArray[i] = byteString.charCodeAt(i);
        }

        mimeString = dataURI.split(',')[0].split(':')[1].split(';')[0];

        if (hasBlobConstructor) {
            return new Blob([hasArrayBufferViewSupport ? intArray : arrayBuffer], { type: mimeString });
        }
        bb = new BlobBuilder();
        bb.append(arrayBuffer);
        return bb.getBlob(mimeString);
    };
    if (window.HTMLCanvasElement && !CanvasPrototype.toBlob) {
        if (CanvasPrototype.mozGetAsFile) {
            CanvasPrototype.toBlob = function (callback, type, quality) {
                if (quality && CanvasPrototype.toDataURL && dataURLtoBlob) {
                    callback(dataURLtoBlob(this.toDataURL(type, quality)));
                } else {
                    callback(this.mozGetAsFile('blob', type));
                }
            };
        } else if (CanvasPrototype.toDataURL && dataURLtoBlob) {
            CanvasPrototype.toBlob = function (callback, type, quality) {
                callback(dataURLtoBlob(this.toDataURL(type, quality)));
            };
        }
    }
    if (typeof define === 'function' && define.amd) {
        define(function () {
            return dataURLtoBlob;
        });
    } else {
        window.dataURLtoBlob = dataURLtoBlob;
    }
}(this));
var png2ajpg;
(function (png2ajpg) {
    (function (utils) {
        var xor = {
            component: function (comp_src, comp_dst, alpha_src, alpha_dst) {
                return comp_src * alpha_src * (1 - alpha_dst) + comp_dst * alpha_dst * (1 - alpha_src);
            },
            alpha: function (alpha_src, alpha_dst) {
                return alpha_src + alpha_dst - 2 * alpha_src * alpha_dst;
            }
        };

        function ajpg2png(rgbImage, alphaChannelImage, jpegMask, embedMask) {
            if (typeof alphaChannelImage === "undefined") { alphaChannelImage = null; }
            if (typeof jpegMask === "undefined") { jpegMask = false; }
            if (typeof embedMask === "undefined") { embedMask = false; }
            var width = rgbImage.width / (embedMask ? 2 : 1);
            var height = rgbImage.height;

            return renderToCanvas(width, height, function (ctx) {
                if (embedMask || jpegMask) {
                    alphaChannelImage = renderToCanvas(width, height, function (ctx) {
                        ctx.drawImage((embedMask ? rgbImage : alphaChannelImage), embedMask ? width : 0, 0, width, height, 0, 0, width, height);
                        var id = ctx.getImageData(0, 0, width, height);
                        var data = id.data;
                        for (var i = data.length - 1; i > 0; i -= 4) {
                            data[i] = 255 - data[i - 3];
                        }
                        ctx.clearRect(0, 0, width, height);
                        ctx.putImageData(id, 0, 0);
                    });
                }

                if (document.all && !window.atob) {
                    var i, x, y, alpha_src, alpha_dst;
                    var alphaImageData = renderToCanvas(width, height, function (ctx) {
                        ctx.drawImage(alphaChannelImage, 0, 0);
                    }).getContext('2d').getImageData(0, 0, width, height).data;
                    var srcCanvas = renderToCanvas(width, height, function (ctx) {
                        ctx.drawImage(rgbImage, 0, 0);
                    });
                    var imageData = srcCanvas.getContext('2d').getImageData(0, 0, width, height);

                    for (y = 0; y < height; y++) {
                        for (x = 0; x < width; x++) {
                            i = (y * width + x) * 4;

                            alpha_dst = imageData.data[i + 3] / 255;
                            alpha_src = (alphaImageData[i + 3]) / 255;

                            imageData.data[i] = xor.component(alphaImageData[i], imageData.data[i], alpha_src, alpha_dst);
                            imageData.data[i + 1] = xor.component(alphaImageData[i + 1], imageData.data[i + 1], alpha_src, alpha_dst);
                            imageData.data[i + 2] = xor.component(alphaImageData[i + 2], imageData.data[i + 2], alpha_src, alpha_dst);
                            imageData.data[i + 3] = xor.alpha(alpha_src, alpha_dst) * 255;
                        }
                    }
                    ctx.putImageData(imageData, 0, 0);
                } else {
                    console.log('webkit');
                    ctx.drawImage(rgbImage, 0, 0);
                    ctx.globalCompositeOperation = 'xor';
                    ctx.drawImage(alphaChannelImage, 0, 0);
                }
            });
        }
        utils.ajpg2png = ajpg2png;

        function getInverseAlphaMask(image, jpegMask) {
            if (typeof jpegMask === "undefined") { jpegMask = false; }
            return renderToCanvas(image.width, image.height, function (ctx) {
                ctx.drawImage(image, 0, 0);

                var idata = ctx.getImageData(0, 0, image.width, image.height);
                var data = idata.data;
                var alpha;
                var pixelColor;
                for (var i = 0; i < data.length; i += 4) {
                    alpha = data[i + 3];
                    pixelColor = 255 - alpha;
                    data[i] = data[i + 1] = data[i + 2] = 255 - (pixelColor);
                    data[i + 3] = jpegMask ? 255 : pixelColor;
                }
                ctx.putImageData(idata, 0, 0);
            });
        }
        utils.getInverseAlphaMask = getInverseAlphaMask;

        function renderToCanvas(width, height, renderFunction) {
            var buffer = document.createElement('canvas');
            buffer.width = width;
            buffer.height = height;
            renderFunction(buffer.getContext('2d'));
            return buffer;
        }
        utils.renderToCanvas = renderToCanvas;
    })(png2ajpg.utils || (png2ajpg.utils = {}));
    var utils = png2ajpg.utils;
})(png2ajpg || (png2ajpg = {}));
var png2ajpg;
(function (png2ajpg) {
    (function (ExportModes) {
        ExportModes[ExportModes["JPG_PNG"] = 1] = "JPG_PNG";
        ExportModes[ExportModes["JPG_JPG"] = 2] = "JPG_JPG";
        ExportModes[ExportModes["JPG_SIDE"] = 3] = "JPG_SIDE";
    })(png2ajpg.ExportModes || (png2ajpg.ExportModes = {}));
    var ExportModes = png2ajpg.ExportModes;
    var DOM = (function () {
        function DOM() {
        }
        DOM.DROP_ZONE = "drop_zone";
        DOM.PREVIEW_TOGGLE = "preview";
        DOM.COLOR_PICKER = "backgroundColor";
        DOM.JPG_LEVEL = "imageCompressionLevel";
        DOM.MASK_LEVEL = "maskCompressionLevel";
        DOM.PARAMETERS_PANNEL = "params";

        DOM.INPUT_IMAGE = "inputImage";
        DOM.PREVIEW_IMAGE = "previewImage";
        DOM.OUTPUT_IMAGE = "outputImage";
        DOM.OUTPUT_MASK = "outputMask";

        DOM.BTN_JPGPNG = "btn-jpgpng";
        DOM.BTN_JPGJPG = "btn-jpgjpg";
        DOM.BTN_JPGSIDE = "btn-jpgside";
        DOM.RANGE_IMAGE = "imageCompressionLevel";
        DOM.RANGE_MASK = "maskCompressionLevel";
        DOM.MAIN_MENU = "main-menu";
        DOM.BTN_SAVE = "btn-save";

        DOM.BG_COLOR_A = "bg-color-A";
        DOM.BG_COLOR_R = "bg-color-R";
        DOM.BG_COLOR_G = "bg-color-G";
        DOM.BG_COLOR_B = "bg-color-B";

        DOM.BG_COLOR_WHITE = "bg-color-White";
        DOM.BG_COLOR_BLACK = "bg-color-Black";
        return DOM;
    })();
    png2ajpg.DOM = DOM;

    var Main = (function () {
        function Main() {
            this.backgroundColor = "#FFFFFF";
            this.currentExportMode = 1;
            this.compressionParams = {
                jpeg: 75,
                mask: 75
            };
            this.initUI();
            this.initListeners();
        }
        Main.prototype.initUI = function () {
            this.mainMenu = document.getElementById(DOM.MAIN_MENU);
            this.colorPicker = document.getElementById(DOM.COLOR_PICKER);
            this.inputImage = document.getElementById(DOM.INPUT_IMAGE);
            this.previewImage = document.getElementById(DOM.PREVIEW_IMAGE);
            this.outputImage = document.getElementById(DOM.OUTPUT_IMAGE);
            this.outputMask = document.getElementById(DOM.OUTPUT_MASK);
            this.dropZone = document.getElementById(DOM.DROP_ZONE);
            this.jpegLevel = document.getElementById(DOM.JPG_LEVEL);
            this.maskLevel = document.getElementById(DOM.MASK_LEVEL);
            this.previewToggle = document.getElementById(DOM.PREVIEW_TOGGLE);
            this.paramsPanel = document.getElementById(DOM.PARAMETERS_PANNEL);

            this.btnJpgPng = document.getElementById(DOM.BTN_JPGPNG);
            this.btnJpgJpg = document.getElementById(DOM.BTN_JPGJPG);
            this.btnJpgSide = document.getElementById(DOM.BTN_JPGSIDE);
            this.rangeImage = document.getElementById(DOM.RANGE_IMAGE);
            this.rangeMask = document.getElementById(DOM.RANGE_MASK);
            this.btnSave = document.getElementById(DOM.BTN_SAVE);

            this.bgColorA = document.getElementById(DOM.BG_COLOR_A);
            this.bgColorR = document.getElementById(DOM.BG_COLOR_R);
            this.bgColorG = document.getElementById(DOM.BG_COLOR_G);
            this.bgColorB = document.getElementById(DOM.BG_COLOR_B);
            this.bgColorWhite = document.getElementById(DOM.BG_COLOR_WHITE);
            this.bgColorBlack = document.getElementById(DOM.BG_COLOR_BLACK);

            this.setBgClass('rgbA');
        };

        Main.prototype.initListeners = function () {
            var _this = this;
            document.addEventListener('dragover', function (e) {
                _this.handleDragOver(e);
            }, false);
            document.addEventListener('drop', function (e) {
                _this.handleFileSelect(e);
            }, false);
            this.colorPicker.addEventListener('change', function (e) {
                _this.backgroundColor = _this.colorPicker.value;
                _this.update();
            }, false);
            this.btnJpgPng.addEventListener('click', function () {
                _this.currentExportMode = 1 /* JPG_PNG */;
                _this.selectOption();
                _this.update();
            });
            this.btnJpgJpg.addEventListener('click', function () {
                _this.currentExportMode = 2 /* JPG_JPG */;
                _this.selectOption();
                _this.update();
            });
            this.btnJpgSide.addEventListener('click', function () {
                _this.currentExportMode = 3 /* JPG_SIDE */;
                _this.selectOption();
                _this.update();
            });
            this.rangeImage.addEventListener('click', function () {
                _this.compressionParams.jpeg = +_this.rangeImage.value;
                _this.update();
            });
            this.rangeMask.addEventListener('click', function () {
                _this.compressionParams.mask = +_this.rangeMask.value;
                _this.update();
            });
            this.btnSave.addEventListener('click', function () {
                _this.exportImages();
            });

            this.bgColorA.addEventListener('click', function () {
                _this.setBgClass('rgbA');
            });
            this.bgColorR.addEventListener('click', function () {
                _this.setBgClass('rgbR');
            });
            this.bgColorG.addEventListener('click', function () {
                _this.setBgClass('rgbG');
            });
            this.bgColorB.addEventListener('click', function () {
                _this.setBgClass('rgbB');
            });
            this.bgColorWhite.addEventListener('click', function () {
                _this.setBgClass('rgbWhite');
            });
            this.bgColorBlack.addEventListener('click', function () {
                _this.setBgClass('rgbBlack');
            });
        };

        Main.prototype.setBgClass = function (cls) {
            document.body.className = cls;
        };
        Main.prototype.exportImages = function () {
            var zip = new JSZip();

            zip.file('image.jpg', this.outputImage.src.split(',')[1], { base64: true });
            if (this.currentExportMode == 1 /* JPG_PNG */)
                zip.file('mask.png', this.outputMask.src.split(',')[1], { base64: true });
            if (this.currentExportMode == 2 /* JPG_JPG */)
                zip.file('mask.jpg', this.outputMask.src.split(',')[1], { base64: true });

            var blob = zip.generate({ type: "blob" });
            window.saveAs(blob, "output.zip");

            return;
            this.downloadFile(this.outputImage.src, 'image.jpg');
            this.downloadFile(this.outputMask.src, 'mask.png');
        };
        Main.prototype.selectOption = function () {
            this.btnJpgPng.className.baseVal = 'option';
            this.btnJpgJpg.className.baseVal = 'option';
            this.btnJpgSide.className.baseVal = 'option';

            this.btnJpgPng.className.baseVal = this.currentExportMode == 1 /* JPG_PNG */ ? 'option option-selected' : 'option';
            this.btnJpgJpg.className.baseVal = this.currentExportMode == 2 /* JPG_JPG */ ? 'option option-selected' : 'option';
            this.btnJpgSide.className.baseVal = this.currentExportMode == 3 /* JPG_SIDE */ ? 'option option-selected' : 'option';
        };
        Main.prototype.handleDragOver = function (evt) {
            evt.stopPropagation();
            evt.preventDefault();
            evt.dataTransfer.dropEffect = 'copy';
        };
        Main.prototype.handleFileSelect = function (evt) {
            var _this = this;
            evt.stopPropagation();
            evt.preventDefault();

            var files = evt.dataTransfer.files;
            if (files.length > 1)
                return;

            this.mainMenu.style.display = 'block';
            this.dropZone.style.display = 'none';

            var output = [];
            var file = files[0];

            var reader = new FileReader();

            reader.onload = (function (theFile, cb) {
                return function (e) {
                    _this.inputImage.onload = function () {
                        cb(_this.inputImage);
                    };
                    _this.inputImage.src = e.target.result;
                };
            })(file, function (img) {
                _this.currentImage = img;
                _this.update();
            });

            reader.readAsDataURL(file);
        };

        Main.prototype.drawBackground = function (ctx) {
            var w = ctx.canvas.width, h = ctx.canvas.height, x, y;
            ctx.fillStyle = '#fff';
            ctx.fillRect(0, 0, w, h);
            ctx.fillStyle = '#ccc';
            for (x = 0; x < w; x += 16) {
                for (y = 0; y < h; y += 16) {
                    ctx.fillRect(x, y, 8, 8);
                    ctx.fillRect(x + 8, y + 8, 8, 8);
                }
            }
        };
        Main.prototype.getAlphaImage = function (image, compression) {
            if (typeof compression === "undefined") { compression = 75; }
            return image.toDataURL('image/' + (this.currentExportMode == 1 /* JPG_PNG */ ? 'png' : 'jpeg'), compression / 100);
        };
        Main.prototype.getJpegAlpha = function (rgbImage, alphaChannelImage) {
            var width = rgbImage.width, height = rgbImage.height;
            return png2ajpg.utils.renderToCanvas(width, height, function (ctx) {
                var alpha = png2ajpg.utils.renderToCanvas(width, height, function (ctx) {
                    var id, data, i;
                    ctx.drawImage(alphaChannelImage, 0, 0);
                    id = ctx.getImageData(0, 0, width, height);
                    data = id.data;
                    for (i = data.length - 1; i > 0; i -= 4) {
                        data[i] = 255 - data[i - 3];
                    }
                    ctx.clearRect(0, 0, width, height);
                    ctx.putImageData(id, 0, 0);
                });
                ctx.drawImage(rgbImage, 0, 0);
                ctx.globalCompositeOperation = 'xor';
                ctx.drawImage(alpha, 0, 0);
            });
        };
        Main.prototype.update = function () {
            var _this = this;
            var w = this.currentImage.width;
            var h = this.currentImage.height;
            var img = this.currentImage;

            var embedMask = this.currentExportMode == 3 /* JPG_SIDE */;
            var jpegMask = this.currentExportMode == 2 /* JPG_JPG */ || this.currentExportMode == 3 /* JPG_SIDE */;
            var alphaImage64 = this.getAlphaImage(png2ajpg.utils.getInverseAlphaMask(img, jpegMask), embedMask ? this.compressionParams.jpeg : this.compressionParams.mask);
            this.outputMask.src = alphaImage64;

            var jpegSided = this.currentExportMode == 3 /* JPG_SIDE */;
            var outputImageCanvas = png2ajpg.utils.renderToCanvas(jpegSided ? w * 2 : w, h, function (ctx) {
                ctx.fillStyle = _this.backgroundColor;
                ctx.fillRect(0, 0, jpegSided ? w * 2 : w, h);
                ctx.drawImage(_this.currentImage, 0, 0);
                jpegSided && ctx.drawImage(_this.outputMask, w, 0);
            });
            this.outputImage.src = outputImageCanvas.toDataURL('image/jpeg', this.compressionParams.jpeg / 100);

            var resultImageSizeBlob = window.dataURLtoBlob && window.dataURLtoBlob(this.outputImage.src);
            console.log(resultImageSizeBlob);

            this.previewImage.src = png2ajpg.utils.renderToCanvas(w, h, function (ctx) {
                if (_this.currentExportMode == 1 /* JPG_PNG */) {
                    ctx.drawImage(png2ajpg.utils.ajpg2png(_this.outputImage, png2ajpg.utils.renderToCanvas(w, h, function (ctx) {
                        ctx.drawImage(_this.outputMask, 0, 0);
                    }), jpegMask, _this.currentExportMode == 3 /* JPG_SIDE */), 0, 0);
                } else {
                    ctx.drawImage(png2ajpg.utils.ajpg2png(_this.outputImage, _this.outputMask, jpegMask, _this.currentExportMode == 3 /* JPG_SIDE */), 0, 0);
                }
            }).toDataURL();
        };
        Main.prototype.downloadFile = function (sUrl, name) {
            if (/(iP)/g.test(navigator.userAgent)) {
                alert('Your device do not support files downloading. Please try again in desktop browser.');
                return false;
            }

            var link = document.createElement('a');
            link.href = sUrl;
            link.target = "_blank";
            link['download'] = name;
            link.click();
            return;
        };
        return Main;
    })();
    png2ajpg.Main = Main;
})(png2ajpg || (png2ajpg = {}));
