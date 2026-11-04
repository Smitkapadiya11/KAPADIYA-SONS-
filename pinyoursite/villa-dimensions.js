import {Vector3} from "three";

// Survey endpoints in Blender metres, using the room-local coordinates of each bake.
const marks={
  exterior:[["Balcony",[-4.825,-4.33,3.04],[4.825,-4.33,3.04]],["Eaves",[-4.65,-2.5,.10],[-4.65,-2.5,6.12]]],
  living:[["Sofa",[-2.02,1.86,.22],[1.18,1.86,.22]],["Rug",[-2.27,-.93,.07],[2.03,-.93,.07]]],
  kitchen:[["Island",[-1.575,-.275,1.12],[1.575,-.275,1.12]],["Counter",[1.40,.04,.02],[1.40,.04,1.12]]],
  bedroom:[["Bed",[-1.16,-.315,.60],[1.16,-.315,.60]],["Headboard",[-1.77,2.66,1.79],[1.77,2.66,1.79]]],
  bath:[["Vanity",[-1.88,2.29,1.085],[1.04,2.29,1.085]],["Bath",[2.45,-.81,.78],[2.45,1.81,.78]]]
};
export function villaDimensions(dialog,camera,redraw){
  const facts=dialog.querySelector(".villa-facts");
  const svg=dialog.querySelector("#villa-lines"),toggle=dialog.querySelector("#measure-villa");
  let active="",enabled=true,rows=[];
  toggle.setAttribute("aria-pressed","true");
  toggle.onclick=()=>{enabled=!enabled;toggle.setAttribute("aria-pressed",String(enabled));redraw()};
  function point(v,inside){
    const p=new Vector3(v[0],v[2],-v[1]);
    // Map rays from the authored panorama camera to its eight-metre viewing sphere.
    return inside?p.sub(new Vector3(-.18,1.46,1.47)).normalize().multiplyScalar(8):p;
  }
  function update(room,w,h){
    svg.style.display=enabled?"":"none";
    facts.hidden=!enabled || room==="exterior";
    if(!enabled)return;
    if(active!==room){
      active=room;svg.replaceChildren();
      const lines=room==="exterior"?marks.exterior:[...marks[room],
        ["Room span",[-3.41,3.38,2.90],[3.425,3.38,2.90]],
        ["Ceiling",[3.35,3.38,.01],[3.35,3.38,3.205]]];
      rows=lines.map(([name,start,end])=>{
        const node=t=>document.createElementNS(svg.namespaceURI,t);
        const group=node("g"),path=node("path"),label=node("text");
        label.textContent=name+" · "+new Vector3(...start).distanceTo(new Vector3(...end)).toFixed(2)+" m";
        group.append(path,label);svg.append(group);
        return {group,path,label,a:point(start,room!=="exterior"),b:point(end,room!=="exterior")};
      });
    }
    for(const {group,path,label,a,b} of rows){
      const u=a.clone().project(camera),v=b.clone().project(camera);
      const x=(u.x+1)*w/2,y=(1-u.y)*h/2,X=(v.x+1)*w/2,Y=(1-v.y)*h/2;
      const length=Math.hypot(X-x,Y-y),dx=(Y-y)/length*4,dy=(x-X)/length*4;
      const mid=(x+X)/2,cy=(y+Y)/2;
      const visible=u.z<1&&v.z<1&&length>18&&mid>22&&mid<w-22&&cy>65&&cy<h-65;
      group.style.display=visible?"":"none";if(!visible)continue;
      path.setAttribute("d",`M${x},${y} L${X},${Y} M${x-dx},${y-dy}l${2*dx},${2*dy} M${X-dx},${Y-dy}l${2*dx},${2*dy}`);
      label.setAttribute("x",Math.max(53,Math.min(w-53,mid)));label.setAttribute("y",cy-8);
    }
  }
  return {update,dispose(){facts.hidden=true;svg.replaceChildren();toggle.onclick=null}};
}
