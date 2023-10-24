# Cleaner for Stable Diffusion WebUI




<table>
  <tr>
    <td align="center" vertical-align="center">
        <a href="https://novita.ai/?utm_source=github_organization&utm_medium=banner&utm_campaign=sd-webui-cleaner">
            <img src="https://raw.githubusercontent.com/wiki/novitalabs/sd-webui-cleaner/images/logo2.png" width="120px;" alt="Unsplash" />
        </a>
    </td>
    <td align="center" vertical-align="center">
      <b>AI image generation API</b>
      <br />
        <span text-align: center>Now we have provided the API for remove object.</span>   
        <a href="https://novita.ai/?utm_source=github_organization&utm_medium=banner&utm_campaign=sd-webui-cleaner">Cleanup API</a>
    </td>
  </tr>
</table>


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

https://github.com/novitalabs/sd-webui-cleaner/assets/55743667/3f9f652b-d3b7-4c08-a4c6-0e9fe731c77c

<br>

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

<br>

### Used without GPU
If you don't have a GPU, please set the cleaner_use_cpu parameter to true through the setting page or api.

<br>

## Thanks
- https://github.com/advimman/lama
- https://github.com/Sanster/lama-cleaner
