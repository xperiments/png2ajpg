/**
 * Main.ts
 * Created by xperiments on 02/10/14.
 */
///<reference path="../reference.ts"/>
interface Window
{
    saveAs( type:any, name:string );
}
module png2ajpg
{


    export enum ExportMode
    {
        JPG_PNG = 1,
        JPG_JPG = 2,
        JPG_SIDE =3
    }
    export class DOM
    {
        static DROP_ZONE:string = "drop_zone";
        static PREVIEW_TOGGLE:string = "preview";
        static COLOR_PICKER:string = "backgroundColor";
        static JPG_LEVEL:string = "imageCompressionLevel";
        static MASK_LEVEL:string = "maskCompressionLevel";
        static PARAMETERS_PANNEL:string = "params";

        static INPUT_IMAGE:string = "inputImage";
        static PREVIEW_IMAGE:string = "previewImage";
        static OUTPUT_IMAGE:string = "outputImage";
        static OUTPUT_MASK:string = "outputMask";

        static BTN_JPGPNG:string = "btn-jpgpng";
        static BTN_JPGJPG:string = "btn-jpgjpg";
        static BTN_JPGSIDE:string = "btn-jpgside";
        static RANGE_IMAGE:string = "imageCompressionLevel";
        static RANGE_MASK:string = "maskCompressionLevel";
        static MAIN_MENU:string = "main-menu";
        static BTN_SAVE:string = "btn-save";



        static BG_COLOR_A:string = "bg-color-A";
        static BG_COLOR_R:string = "bg-color-R";
        static BG_COLOR_G:string = "bg-color-G";
        static BG_COLOR_B:string = "bg-color-B";

        static BG_COLOR_WHITE:string = "bg-color-White";
        static BG_COLOR_BLACK:string = "bg-color-Black";





    }

    export interface ICompressionParams
    {
        jpeg:number;
        mask:number;

    }
    export class Main
    {
        backgroundColor:string = "#FFFFFF";
        mainMenu:HTMLElement;
        inputImage:HTMLImageElement;
        previewImage:HTMLImageElement;
        outputImage:HTMLImageElement;
        outputMask:HTMLImageElement;

        dropZone:HTMLElement;
        colorPicker:HTMLInputElement;
        previewToggle:HTMLInputElement;
        jpegLevel:HTMLInputElement;
        maskLevel:HTMLInputElement;
        paramsPanel:HTMLElement;

        btnJpgPng:HTMLElement;
        btnJpgJpg:HTMLElement;
        btnJpgSide:HTMLElement;
        rangeImage:HTMLInputElement;
        rangeMask:HTMLInputElement;
        btnSave:HTMLElement;

        bgColorA:HTMLElement;
        bgColorR:HTMLElement;
        bgColorG:HTMLElement;
        bgColorB:HTMLElement;

        bgColorWhite:HTMLElement;
        bgColorBlack:HTMLElement;



        currentImage:HTMLImageElement;
        currentExportMode:ExportMode = 1;
        compressionParams:ICompressionParams = {
            jpeg:75,
            mask:75
        };
        constructor()
        {
            this.initUI();
            this.initListeners();
        }

        initUI()
        {
            this.mainMenu = <HTMLElement>document.getElementById(DOM.MAIN_MENU);
            this.colorPicker = <HTMLInputElement>document.getElementById(DOM.COLOR_PICKER);
            this.inputImage = <HTMLImageElement>document.getElementById(DOM.INPUT_IMAGE);
            this.previewImage = <HTMLImageElement>document.getElementById(DOM.PREVIEW_IMAGE);
            this.outputImage = <HTMLImageElement>document.getElementById(DOM.OUTPUT_IMAGE);
            this.outputMask = <HTMLImageElement>document.getElementById(DOM.OUTPUT_MASK);
            this.dropZone = <HTMLImageElement>document.getElementById(DOM.DROP_ZONE);
            this.jpegLevel = <HTMLInputElement>document.getElementById(DOM.JPG_LEVEL);
            this.maskLevel = <HTMLInputElement>document.getElementById(DOM.MASK_LEVEL);
            this.previewToggle = <HTMLInputElement>document.getElementById(DOM.PREVIEW_TOGGLE);
            this.paramsPanel = <HTMLImageElement>document.getElementById(DOM.PARAMETERS_PANNEL);

            this.btnJpgPng = <HTMLElement>document.getElementById(DOM.BTN_JPGPNG);
            this.btnJpgJpg = <HTMLElement>document.getElementById(DOM.BTN_JPGJPG);
            this.btnJpgSide = <HTMLElement>document.getElementById(DOM.BTN_JPGSIDE);
            this.rangeImage = <HTMLInputElement>document.getElementById(DOM.RANGE_IMAGE);
            this.rangeMask = <HTMLInputElement>document.getElementById(DOM.RANGE_MASK);
            this.btnSave = <HTMLElement>document.getElementById(DOM.BTN_SAVE);


            this.bgColorA = <HTMLElement>document.getElementById(DOM.BG_COLOR_A);
            this.bgColorR = <HTMLElement>document.getElementById(DOM.BG_COLOR_R);
            this.bgColorG = <HTMLElement>document.getElementById(DOM.BG_COLOR_G);
            this.bgColorB = <HTMLElement>document.getElementById(DOM.BG_COLOR_B);
            this.bgColorWhite = <HTMLElement>document.getElementById(DOM.BG_COLOR_WHITE);
            this.bgColorBlack = <HTMLElement>document.getElementById(DOM.BG_COLOR_BLACK);


            this.setBgClass('rgbA');
        }

        initListeners() {

            document.addEventListener('dragover',(e:DragEvent)=>{ this.handleDragOver(e) }, false);
            document.addEventListener('drop', (e:DragEvent)=>{ this.handleFileSelect(e) }, false);
            this.colorPicker.addEventListener('change', (e:Event)=>{ this.backgroundColor = this.colorPicker.value; this.update() }, false);
            this.btnJpgPng.addEventListener('click',()=>{ this.currentExportMode = ExportMode.JPG_PNG; this.selectOption();this.update();});
            this.btnJpgJpg.addEventListener('click',()=>{ this.currentExportMode = ExportMode.JPG_JPG; this.selectOption();this.update();});
            this.btnJpgSide.addEventListener('click',()=>{ this.currentExportMode = ExportMode.JPG_SIDE; this.selectOption();this.update();});
            this.rangeImage.addEventListener('click',()=>{ this.compressionParams.jpeg = +this.rangeImage.value; this.update();});
            this.rangeMask.addEventListener('click',()=>{ this.compressionParams.mask = +this.rangeMask.value; this.update();});
            this.btnSave.addEventListener('click',()=>{ this.exportImages();});

            this.bgColorA.addEventListener('click',()=>{ this.setBgClass('rgbA');});
            this.bgColorR.addEventListener('click',()=>{ this.setBgClass('rgbR');});
            this.bgColorG.addEventListener('click',()=>{ this.setBgClass('rgbG');});
            this.bgColorB.addEventListener('click',()=>{ this.setBgClass('rgbB');});
            this.bgColorWhite.addEventListener('click',()=>{ this.setBgClass('rgbWhite');});
            this.bgColorBlack.addEventListener('click',()=>{ this.setBgClass('rgbBlack');});



        }

        private setBgClass( cls:string )
        {
            document.body.className = cls;
        }
        private exportImages()
        {

            var zip = new JSZip();

            zip.file('image.jpg',this.outputImage.src.split(',')[1],{base64:true});

            switch( this.currentExportMode )
            {
                case ExportMode.JPG_PNG:

                    zip.file('mask.png',this.outputMask.src.split(',')[1],{base64:true});
                    var svgMask = png2ajpg.utils.renderToCanvas( this.outputMask.width, this.outputMask.height, (ctx:CanvasRenderingContext2D)=>{
                        ctx.fillStyle="#FFFFFF";
                        ctx.fillRect(0,0,this.outputMask.width, this.outputMask.height);
                        ctx.drawImage(this.outputMask,0,0);
                    });
                    zip.file('mask.svg.png',svgMask.toDataURL().split(',')[1],{base64:true});
                    zip.file('index.html',jpgPng.html);

                    break;
                case ExportMode.JPG_JPG:
                    zip.file('mask.jpg',this.outputMask.src.split(',')[1],{base64:true});
                    zip.file('index.html',jpgJpg.html);

                    break;
                case ExportMode.JPG_SIDE:
                    zip.file('index.html',jpgSide.html);
                    break;
            }

            var blob = zip.generate({type:"blob"});
            window.saveAs(blob, "output.zip");

        }
        private selectOption()
        {

            (<SVGSVGElement><any>this.btnJpgPng).className.baseVal = 'option';
            (<SVGSVGElement><any>this.btnJpgJpg).className.baseVal = 'option';
            (<SVGSVGElement><any>this.btnJpgSide).className.baseVal= 'option';

            (<SVGSVGElement><any>this.btnJpgPng).className.baseVal = this.currentExportMode == ExportMode.JPG_PNG ? 'option option-selected':'option';
            (<SVGSVGElement><any>this.btnJpgJpg).className.baseVal = this.currentExportMode == ExportMode.JPG_JPG ? 'option option-selected':'option';
            (<SVGSVGElement><any>this.btnJpgSide).className.baseVal = this.currentExportMode == ExportMode.JPG_SIDE ? 'option option-selected':'option';
        }
        private handleDragOver( evt:DragEvent ) {
            evt.stopPropagation();
            evt.preventDefault();
            evt.dataTransfer.dropEffect = 'copy'; // Explicitly show this is a copy.
        }
        private handleFileSelect(evt:DragEvent)
        {
            evt.stopPropagation();
            evt.preventDefault();

            var files = evt.dataTransfer.files; // FileList object.
            if (files.length > 1) return;

            this.mainMenu.style.display = 'block';
            this.dropZone.style.display = 'none';

            var file = files[0];

            var reader = new FileReader();

            // Closure to capture the file information.
            reader.onload = ((theFile, cb)=> {
                return (e)=> {
                    this.inputImage.onload = ()=> {
                        cb(this.inputImage);
                    }
                    this.inputImage.src = e.target.result;
                };
            })(file, (img)=> {

                this.currentImage = img;
                this.update();

            });

            // Read in the image file as a data URL.
            reader.readAsDataURL(file);
        }

        drawBackground (ctx:CanvasRenderingContext2D) {
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
        }
        getAlphaImage(image:HTMLCanvasElement, compression:number = 75) {
            return image.toDataURL('image/' + (this.currentExportMode == ExportMode.JPG_PNG ? 'png' : 'jpeg'), compression/100 );
        }
        getJpegAlpha( rgbImage, alphaChannelImage)
        {
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
        }
        public update() {

            var w = this.currentImage.width;
            var h = this.currentImage.height;
            var img = this.currentImage;

            // generate mask image
            var embedMask = this.currentExportMode == ExportMode.JPG_SIDE;
            var jpegMask = this.currentExportMode == ExportMode.JPG_JPG || this.currentExportMode == ExportMode.JPG_SIDE;
            var alphaImage64 = this.getAlphaImage( png2ajpg.utils.getInverseAlphaMask(<HTMLCanvasElement><any>img, jpegMask), embedMask ? this.compressionParams.jpeg:this.compressionParams.mask );
            this.outputMask.src = alphaImage64;

            var jpegSided = this.currentExportMode == ExportMode.JPG_SIDE;
            var outputImageCanvas = png2ajpg.utils.renderToCanvas( jpegSided ? w * 2 :w, h ,(ctx:CanvasRenderingContext2D)=>{

                ctx.fillStyle=this.backgroundColor;
                ctx.fillRect(0, 0, jpegSided ? w * 2 : w, h);
                ctx.drawImage(this.currentImage, 0, 0);
                jpegSided && ctx.drawImage(this.outputMask, w, 0);

            });
            this.outputImage.src = outputImageCanvas.toDataURL('image/jpeg', this.compressionParams.jpeg / 100);

            var resultImageSizeBlob = window.dataURLtoBlob && window.dataURLtoBlob(this.outputImage.src);
                console.log( resultImageSizeBlob );

            this.previewImage.src = png2ajpg.utils.renderToCanvas( w,h,( ctx:CanvasRenderingContext2D )=>{
                    if( this.currentExportMode == ExportMode.JPG_PNG )
                    {
                        /*
                        ctx.drawImage( this.outputImage,0,0);
                        ctx.globalCompositeOperation = 'xor';
                        ctx.drawImage(this.outputMask, 0, 0);
                        */
                        ctx.drawImage(
                            png2ajpg.utils.ajpg2png(
                                <HTMLCanvasElement><any>this.outputImage,
                                <HTMLCanvasElement><any>png2ajpg.utils.renderToCanvas(w,h,(ctx)=>{ ctx.drawImage(this.outputMask,0,0)}),
                                jpegMask,
                                    this.currentExportMode == ExportMode.JPG_SIDE
                            ),
                            0,0
                        );
                    }
                    else
                    {

                        ctx.drawImage(
                            png2ajpg.utils.ajpg2png(
                                <HTMLCanvasElement><any>this.outputImage,
                                <HTMLCanvasElement><any>this.outputMask,
                                jpegMask,
                                this.currentExportMode == ExportMode.JPG_SIDE
                            ),
                            0,0
                        );
                    }

            }).toDataURL();

        }
        private downloadFile (sUrl:string, name:string ) {

            //iOS devices do not support downloading. We have to inform user about this.
            if (/(iP)/g.test(navigator.userAgent)) {
                alert('Your device do not support files downloading. Please try again in desktop browser.');
                return false;
            }

                var link = document.createElement('a');
                link.href = sUrl;
                link.target="_blank";
                link['download'] = name;
                link.click();
                return;


        }



    }


}

