# Cleaner for Stable Diffusion WebUI
This is a WEBUI extension that provides image erasure functionality. It supports both UI and API simultaneously. Powered by [lama](https://github.com/advimman/lama)


![example1](https://raw.githubusercontent.com/wiki/novitalabs/sd-webui-cleaner/images/example1.png)

<br>

## Installation
Clone this project in the WEBUI extensions folder
```
git clone https://github.com/novitalabs/sd-webui-cleaner.git
```
<br>

## Get Started

### API

```
//request-----------------------------------
POST http://127.0.0.1:7860/cleanup

body:
{
    "input_image": "<image base64 string>",
    "mask": "<mask base64 string>"
}


//response-----------------------------------
{
  "code": 0,  // 0:success
  "message": "ok",
  "image": "<image base64 string>"
}
```

## Thanks
- https://github.com/advimman/lama
- https://github.com/Sanster/lama-cleaner
