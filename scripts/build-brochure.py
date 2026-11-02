from pathlib import Path
from reportlab.pdfgen import canvas
from reportlab.lib.colors import HexColor
from reportlab.pdfbase import pdfmetrics
from reportlab.pdfbase.ttfonts import TTFont
from reportlab.lib.utils import ImageReader
from PIL import Image
import json
out=Path('pinyoursite/public/pinyoursite-demo.pdf')
pdfmetrics.registerFont(TTFont('Manrope','public/fonts/manrope-800.ttf'))
pdfmetrics.registerFont(TTFont('DM','public/fonts/dm-sans-400.ttf'))
c=canvas.Canvas(str(out),pagesize=(595.28,841.89))
c.setTitle('PinYourSite by Kapadiya & Sons - Demonstration brochure')
c.setAuthor('Kapadiya & Sons')
W,H=595.28,841.89
c.setFillColor(HexColor('#10291e'));c.rect(0,0,W,H,fill=1,stroke=0)
c.setFillColor(HexColor('#c6f986'));c.setFont('DM',9);c.drawString(40,795,'PINYOURSITE / BY KAPADIYA & SONS')
c.setFont('Manrope',41);c.drawString(40,735,'A world in');c.drawString(40,685,'your hand.')
c.setFillColor(HexColor('#edf1e5'));c.setFont('DM',12);c.drawString(40,650,'Interactive property experiences, made for your clients.')
c.drawImage(ImageReader('pinyoursite/public/gallery/01.webp'),40,355,width=515,height=272,mask='auto',preserveAspectRatio=True,anchor='c')
c.setFont('DM',7);c.setFillColor(HexColor('#a8baa9'));c.drawString(40,341,'REFERENCE PROJECT VISUAL / DEMONSTRATION ONLY')
c.setFillColor(HexColor('#edf1e5'));c.setFont('Manrope',24);c.drawString(40,291,"Architect's Cut")
c.setFillColor(HexColor('#c6f986'));c.setFont('Manrope',30);c.drawString(40,247,'INR 50,000')
c.setFillColor(HexColor('#edf1e5'));c.setFont('DM',11)
for i,s in enumerate(['Complete 3D informational web view.','All the project information your client needs.','Interactive plots, search, gallery and enquiry pathways.']):c.drawString(40,214-i*20,s)
c.setStrokeColor(HexColor('#53664a'));c.line(40,127,555,127)
c.setFont('DM',10);c.drawString(40,102,'+91 75758 07403');c.drawString(250,102,'smitkapadiya.work@gmail.com')
c.drawString(40,78,'www.kapadiya.tech');c.drawString(250,78,'pinyoursite-kapadiya.vercel.app')
c.linkURL('https://www.kapadiya.tech',(40,70,200,90),relative=0)
c.linkURL('https://pinyoursite-kapadiya.vercel.app',(250,70,550,90),relative=0)
c.setFont('DM',7);c.setFillColor(HexColor('#a8baa9'));c.drawString(40,35,'DEMONSTRATION BROCHURE - NOT AN OFFER OF SALE');c.drawRightString(555,35,'01 / 02')
c.showPage()
c.setFillColor(HexColor('#edf1e5'));c.rect(0,0,W,H,fill=1,stroke=0)
c.setFillColor(HexColor('#10291e'));c.setFont('DM',9);c.drawString(40,795,'PINYOURSITE / THE PROJECT EXPERIENCE')
c.setFont('Manrope',31);c.drawString(40,739,'Every plot. Every detail.')
c.setFont('DM',11)
c.drawString(40,706,'This demonstration contains 63 interactive plots.')
c.drawString(40,687,'Project details and status data are illustrative, not live inventory.')
im=Image.open('pinyoursite/public/masterplan.webp').convert('RGBA')
bg=Image.new('RGBA',im.size,'#10291e');bg.alpha_composite(im)
c.drawImage(ImageReader(bg.convert('RGB')),40,365,width=515,height=290,mask='auto')
geo=json.loads(Path('pinyoursite/plots.json').read_text())
# Draw the same interactive plot outlines over the plan in PDF coordinates.
c.saveState();c.translate(40,365);c.scale(515/1920,290/1080)
for p in geo:
 pts=[tuple(map(float,t.split(','))) for t in p['points'].split()]
 path=c.beginPath();path.moveTo(pts[0][0],1080-pts[0][1])
 for x,y in pts[1:]:path.lineTo(x,1080-y)
 path.close();c.setStrokeColor(HexColor('#314a2b'));c.setLineWidth(1);c.drawPath(path,stroke=1,fill=0)
 c.setFillColor(HexColor('#203721'));c.setFont('DM',12);c.drawCentredString(p['x'],1080-p['y']-4,str(p['id']))
c.restoreState()
c.setFillColor(HexColor('#10291e'));c.setFont('Manrope',18);c.drawString(40,330,'Made for discovery.')
c.setFont('DM',11)
lines=['Search by plot number, area or status.','Select a plot to see its area and outline.','Explore the gallery and nearby-location links.','Share a project or plot link, then start a WhatsApp enquiry.']
for i,s in enumerate(lines):c.drawString(40,297-i*23,s)
c.setStrokeColor(HexColor('#b6c7a6'));c.line(40,187,555,187)
c.setFont('Manrope',15);c.drawString(40,161,'Make this experience your own.')
c.setFont('DM',10)
for i,s in enumerate(['Your project receives its own brand, verified plan and information.','Final scope, taxes, revisions and delivery dates are agreed before booking.','This demo does not reserve plots or collect payments.']):c.drawString(40,136-i*18,s)
c.setFont('DM',7);c.drawString(40,35,'KAPADIYA & SONS - DEMONSTRATION ONLY');c.drawRightString(555,35,'02 / 02')
c.save()
print(out)
