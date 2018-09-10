'use strict';

const request = require('request-promise-native');
const cheerio = require('cheerio');
const mUrl = require('url');
const requestImageSize = require('request-image-size');

exports.handler = (event, context, callback) => {

    const userAgent = 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_12_6) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/65.0.3325.162 Safari/537.36';
    let url = event.url;
    
    if(event.url.substr(0,6) === 'http://' || event.url.substr(0,7) === 'https://') {
        url = event.url;
    } else {
        url = 'http://'+event.url;
    }
    var getOptions = (p_url, transform=false) => {
        var opt = {
            url: p_url,
            headers: {
                'User-Agent': userAgent
            }
        };
        if(transform) {
            opt.transform = function (body) {
                return cheerio.load(body);
            };
        }
        return opt;
    };

    // Resolve relative and absolute URLs to full url
    const resolveUrl = (baseUrl, assetUrl) => {
        if(!baseUrl || !assetUrl) return undefined;
        let obj = mUrl.parse(assetUrl);
        if(!obj.host) {
            return mUrl.resolve(baseUrl, assetUrl);
        }
        return assetUrl;
    };

    getPreview(getOptions(url, true)).then(preview => {
        // console.log(preview);
        callback(null, preview);
    }).catch(err => {
        console.log(err);
        callback('Invalid or unreachable URL', null);
    });

    // function to generate preview. Returns promise.
    async function getPreview(options) {
        var $ = await request(options);
        var data = {};
        data.url = options.url;

        // Getting title of the page
        let title = [];
        title[0] = $('meta[property="og:title"]').attr('content');
        title[1] = $('title').text();
        title[2] = mUrl.parse(url).hostname;
        data.title = title[0] || title[1] || title[2] || 'URL Invalid';

        // Getting description of page
        let description = [];
        description[0] = $('meta[property="og:description"]').attr('content');
        description[1] = $('meta[name="description"]').attr('content');
        description[2] = $('h1').text();
        description[3] = $('h2').text();
        data.description = description[0] || description[1] || description[2] || description[3] || url;
        data.description = data.description.length > 300 ? data.description.substr(0, 300)+'...' : data.description;

        // Getting image
        let image = [];
        image[0] = $('meta[property="og:image"]').attr('content');
        if(!image[0] || image[0] == undefined) {
            var maxArea = {area: -1, url: ''};
            var imgArray = [];
            $('img:not([src*="data:image"])').each((index, element) => {
                let image_url = resolveUrl(url, $(element).attr('src'));
                image_url = resolveUrl(url, image_url);
                if(image_url) imgArray.unshift(image_url);
            });
            for(var i in imgArray) {
                let p = await getAreaOfImage(getOptions(imgArray[i]));
                if(p.area > maxArea.area && (p.height >= 144 || p.width >= 144)) {
                    maxArea.area = p.area;
                    maxArea.url = p.url;
                }
            };
            image[1] = maxArea.area > 0 ? maxArea.url : null; 
        }
        if(!image[1] || image[1] === null) {
            var maxSize = {size: -1, url: ''};
            $('link[rel="icon"], link[rel="apple-touch-icon"]').each((index, element) => {
                let size = $(element).attr('sizes');
                size = size.split('x')[0];
                if(size > maxSize.size && size >= 144) {
                    maxSize.size = size;
                    maxSize.url = resolveUrl(url, $(element).attr('href'));
                }
            });
            image[2] = maxSize.size > 0 ? maxSize.url : null;
        }

        image[3] = null;
        
        data.image = image[0] || image[1] || image[2] || image[3];

        return Promise.resolve(data);

    }

    async function getAreaOfImage(image_url) {
        var res;
        await requestImageSize(image_url)
        .then(size => { 
            res = Promise.resolve({area: size.height*size.width, url: image_url.url, width:size.width, height:size.height});
        }).catch(err => {
            res = Promise.resolve({area: -1, url: image_url.url, width:-1, height:-1});
        });
        return res;
    }
    
};