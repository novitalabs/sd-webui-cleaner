from litelama import LiteLama
from litelama.model import download_file
import os
import gradio as gr
from fastapi import FastAPI, Body
from modules.shared import opts


EXTENSION_PATH = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
MODEL_PATH = os.path.join(EXTENSION_PATH, "models")


def clean_object_init_img_with_mask(init_img_with_mask):
    return clean_object(init_img_with_mask['image'],init_img_with_mask['mask'])


def clean_object(image,mask):
    
    Lama = LiteLama2()
    
    init_image = image
    mask_image = mask

    init_image = init_image.convert("RGB")
    mask_image = mask_image.convert("RGB")

    device_used = opts.data.get("cleaner_use_gpu",True)

    device = "cuda:0"
    if not device_used:
        device = "cpu"

    result = None
    try:
        Lama.to(device)
        result = Lama.predict(init_image, mask_image)
    except:
        pass
    finally:
        Lama.to("cpu")
    
    return [result]


class LiteLama2(LiteLama):
    
    _instance = None
    
    def __new__(cls, *args, **kw):
        if cls._instance is None:
            cls._instance = object.__new__(cls, *args, **kw)
        return cls._instance
        
    def __init__(self, checkpoint_path=None, config_path=None):
        self._checkpoint_path = checkpoint_path
        self._config_path = config_path
        self._model = None
        
        if self._checkpoint_path is None:
            
            checkpoint_path = os.path.join(MODEL_PATH, "big-lama.safetensors")
            if  os.path.exists(checkpoint_path) and os.path.isfile(checkpoint_path):
                pass
            else:
                download_file("https://huggingface.co/anyisalin/big-lama/resolve/main/big-lama.safetensors", checkpoint_path)
                
            self._checkpoint_path = checkpoint_path
        
        self.load(location="cpu")
