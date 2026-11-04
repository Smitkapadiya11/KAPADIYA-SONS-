import bpy
from pathlib import Path
scene=bpy.context.scene
root=Path(__file__).resolve().parents[1]
# Keep the window as the dominant source, with soft bounced light in the shadows.
import sys
resume='--resume' in sys.argv
if not resume:
    sys.path.insert(0,str(root/'scripts'))
    from villa_room_materials import style_rooms
    style_rooms(root)
    for ob in scene.objects:
        if ob.type=="LIGHT" and ob.data.type=="AREA" and ob.data.size>2:
            ob.data.energy=125 if ob.data.size<3 else 475
    scene.render.resolution_x=4096;scene.render.resolution_y=2048
    scene.cycles.samples=24;scene.cycles.use_denoising=True
    scene.render.image_settings.quality=87
    bpy.context.preferences.filepaths.save_version=0
    bpy.ops.wm.save_as_mainfile(filepath=str(root/'design/villa-interiors.blend'),compress=True)
prefs=bpy.context.preferences.addons["cycles"].preferences
for backend in ["OPTIX","CUDA","HIP","METAL"]:
    try:
        prefs.compute_device_type=backend;prefs.get_devices()
        if any(d.type==backend for d in prefs.devices):
            for device in prefs.devices:device.use=device.type==backend
            scene.cycles.device="GPU";break
    except (TypeError,RuntimeError):pass
for name in ['living','kitchen','bedroom','bath']:
    scene.camera=bpy.data.objects[name+' tour point']
    scene.render.filepath=str(root/'pinyoursite/public/rooms'/(name+'.webp'))
    if resume:
        image=bpy.data.images.load(scene.render.filepath)
        done=tuple(image.size)==(4096,2048)
        bpy.data.images.remove(image)
        if done:continue
    bpy.ops.render.render(write_still=True)
