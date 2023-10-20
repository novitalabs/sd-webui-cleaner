import modules.scripts as scripts
import gradio as gr

from modules.shared import opts,OptionInfo

from modules import script_callbacks
from modules.ui_components import ToolButton, ResizeHandleRow
import modules.generation_parameters_copypaste as parameters_copypaste
from modules.ui_common import save_files

from scripts import lama
from PIL import Image

def on_ui_settings():
    section = ('cleaner', "Cleaner")
    opts.add_option("cleaner_use_gpu", OptionInfo(True, "Is Use GPU", gr.Checkbox, {"interactive": True}, section=section))


def send_to_cleaner(result):
    image = Image.open(result[0]["name"])

    print(image)

    return image

def on_ui_tabs():
    

        
    with gr.Blocks() as object_cleaner_tab:

        for tab_name in ["Clean up", "Clean up upload"]:

            with gr.Tab(tab_name) as clean_up_tab, ResizeHandleRow(equal_height=False):

                init_img_with_mask = None
                clean_up_init_img = None
                clean_up_init_mask = None

                if tab_name == "Clean up":
                    init_img_with_mask = gr.Image(label="Image for clean up with mask", show_label=False, elem_id="cleanup_img2maskimg", source="upload",
                                                  interactive=True, type="pil", tool="sketch", image_mode="RGBA", height=650, brush_color=opts.img2img_inpaint_mask_brush_color)
                else:
                    with gr.Column(elem_id=f"cleanup_image_mask"):
                        clean_up_init_img = gr.Image(label="Image for cleanup", show_label=False, source="upload",
                                                     interactive=True, type="pil", elem_id="cleanup_img_inpaint_base", height=325)
                        clean_up_init_mask = gr.Image(
                            label="Mask", source="upload", interactive=True, type="pil", image_mode="RGBA", elem_id="cleanup_img_inpaint_mask", height=325)

                with gr.Row():

                    with gr.Column(elem_id=f"cleanup_gallery_container"):

                        clean_button = gr.Button("Clean Up", height=100)
                        result_gallery = gr.Gallery(
                            label='Output', show_label=False, elem_id=f"cleanup_gallery", preview=True, height=512)

                        with gr.Row(elem_id=f"image_buttons", elem_classes="image-buttons"):

                            buttons = {
                                'img2img': ToolButton('🖼️', elem_id=f'_send_to_img2img', tooltip="Send image and generation parameters to img2img tab."),
                                'inpaint': ToolButton('🎨️', elem_id=f'_send_to_inpaint', tooltip="Send image and generation parameters to img2img inpaint tab."),
                                'extras': ToolButton('📐', elem_id=f'_send_to_extras', tooltip="Send image and generation parameters to extras tab.")
                            }

                            for paste_tabname, paste_button in buttons.items():
                                parameters_copypaste.register_paste_params_button(parameters_copypaste.ParamBinding(
                                    paste_button=paste_button, tabname=paste_tabname, source_tabname=None, source_image_component=result_gallery,
                                    paste_field_names=[]
                                ))

                        send_to_cleaner_button = gr.Button("Send back To clean up", height=100)


                        if tab_name == "Clean up":
                            clean_button.click(
                                fn=lama.clean_object_init_img_with_mask,
                                inputs=[init_img_with_mask],
                                outputs=[
                                    result_gallery
                                ],
                            )

                            send_to_cleaner_button.click(
                                fn=send_to_cleaner,
                                inputs=[result_gallery],
                                outputs=[
                                    init_img_with_mask
                                ]
                            )
                        else:

                            clean_button.click(
                                fn=lama.clean_object,
                                inputs=[clean_up_init_img, clean_up_init_mask],
                                outputs=[
                                    result_gallery
                                ],
                            )

                            send_to_cleaner_button.click(
                                fn=send_to_cleaner,
                                inputs=[result_gallery],
                                outputs=[
                                    clean_up_init_img
                                ]
                            )

    return (object_cleaner_tab, "Cleaner", "cleaner_tab"),


script_callbacks.on_ui_tabs(on_ui_tabs)
script_callbacks.on_ui_settings(on_ui_settings)

