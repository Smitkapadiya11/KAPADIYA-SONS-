"""Generate small, seamless neutral detail maps; material tint stays in the GLB."""
from pathlib import Path
import numpy as np
from PIL import Image
out=Path(__file__).resolve().parents[1]/'pinyoursite/public/finishes'
out.mkdir(exist_ok=True)
n=512
rng=np.random.default_rng(78)
def noise(w,h):
    a=rng.random((h,w))
    pad=np.pad(a,1,mode='wrap')
    image=Image.fromarray((pad*255).astype('uint8')).resize(((w+2)*n//w,(h+2)*n//h),Image.Resampling.BICUBIC)
    return np.asarray(image.crop((n//w,n//h,n//w+n,n//h+n))).astype(float)/255-.5
def save(name,a):
    Image.fromarray(np.clip(a,0,255).astype('uint8')).save(out/(name+'.webp'),quality=86)
save('stone',231+noise(8,8)*16+noise(48,48)*12+noise(256,256)*27)
x,y=np.meshgrid(np.arange(n)/n,np.arange(n)/n)
save('timber',223+noise(8,128)*42+noise(16,256)*16+8*np.cos(2*np.pi*(y*27+noise(4,8)*.8)))
