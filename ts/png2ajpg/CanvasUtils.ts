/**
 * CanvasUtils.ts
 * Created by xperiments on 02/10/14.
 */
///<reference path="../reference.ts"/>


module png2ajpg.utils
{

	var xor = {
		component: function(comp_src, comp_dst, alpha_src, alpha_dst) {
			return comp_src * alpha_src * (1 - alpha_dst) + comp_dst * alpha_dst * (1 - alpha_src);
		},
		alpha: function(alpha_src, alpha_dst) {
			return alpha_src + alpha_dst - 2 * alpha_src * alpha_dst;
		}
	};
    export interface IRenderable
    {
        width:number;
        height:number;
    }
    export function ajpg2png( rgbImage:HTMLCanvasElement, alphaChannelImage:HTMLCanvasElement =null, jpegMask:boolean = false, embedMask:boolean = false ):HTMLCanvasElement
    {
        var width = rgbImage.width / (embedMask ? 2:1);
        var height = rgbImage.height;

        return renderToCanvas(width, height, function (ctx) {
            if( embedMask || jpegMask )
            {
                alphaChannelImage = renderToCanvas(width, height, function (ctx) {

                    ctx.drawImage(<HTMLCanvasElement>(embedMask ? rgbImage:alphaChannelImage), embedMask ? width:0, 0, width, height, 0, 0, width, height);
                    var id:ImageData = ctx.getImageData(0, 0, width, height);
                    var data = id.data;
                    for (var i = data.length - 1; i > 0; i -= 4) {
                        data[i] = 255 - data[i - 3];
                    }
                    ctx.clearRect(0, 0, width, height);
                    ctx.putImageData(id, 0, 0);
                });
            }


            if( document.all && !window.atob /* IE9 */ )
            {

                var i, x, y, alpha_src, alpha_dst;
                var alphaImageData  = renderToCanvas( width,height,(ctx)=>{ ctx.drawImage(alphaChannelImage,0,0); }).getContext('2d').getImageData(0, 0, width, height).data;
                var srcCanvas = renderToCanvas( width,height,(ctx)=>{ ctx.drawImage(rgbImage,0,0); });
                var imageData = srcCanvas.getContext('2d').getImageData(0,0,width,height);

                for (y = 0; y < height; y++) {
                    for (x = 0; x < width; x++) {
                        i = (y * width + x) * 4;

                        alpha_dst = imageData.data[i+3] / 255;
                        alpha_src = (alphaImageData[i+3]) / 255;

                        imageData.data[i]   = xor.component(alphaImageData[i],   imageData.data[i], alpha_src, alpha_dst);
                        imageData.data[i+1] = xor.component(alphaImageData[i+1], imageData.data[i+1], alpha_src, alpha_dst);
                        imageData.data[i+2] = xor.component(alphaImageData[i+2], imageData.data[i+2], alpha_src, alpha_dst);
                        imageData.data[i+3] = xor.alpha(alpha_src, alpha_dst) * 255;
                    }
                }
                ctx.putImageData( imageData,0,0);
            }
            else
            {
                console.log('webkit')
                ctx.drawImage(<HTMLCanvasElement>rgbImage, 0, 0);
                ctx.globalCompositeOperation = 'xor';
                ctx.drawImage(alphaChannelImage, 0, 0);
            }

        });
    }


    export function getInverseAlphaMask(image:HTMLCanvasElement, jpegMask:boolean = false) {

        return renderToCanvas( image.width, image.height, ( ctx:CanvasRenderingContext2D )=>{
            ctx.drawImage(image, 0, 0);

            var idata = ctx.getImageData(0, 0, image.width, image.height);
            var data:Uint8Array = idata.data;
            var alpha:number;
            var pixelColor:number;
            for (var i = 0; i < data.length; i += 4) {
                alpha = data[i + 3];
                pixelColor = 255 - alpha;
                data[i] = data[i + 1] = data[i + 2] = 255 - (pixelColor);
                data[i + 3] = jpegMask ? 255 : pixelColor;
            }
            ctx.putImageData(idata, 0, 0);
        });

    }

    export function renderToCanvas(width:number, height:number, renderFunction:(ctx:CanvasRenderingContext2D)=>void ):HTMLCanvasElement {
        var buffer = <HTMLCanvasElement>document.createElement('canvas');
        buffer.width = width;
        buffer.height = height;
        renderFunction(buffer.getContext('2d'));
        return buffer;
    }
}

