from io import BytesIO
from reportlab.lib.pagesizes import A4
from reportlab.platypus import SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle
from reportlab.lib.styles import getSampleStyleSheet
from reportlab.lib import colors

def build_pdf(title, summary, columns, rows):
    buf=BytesIO(); doc=SimpleDocTemplate(buf,pagesize=A4,rightMargin=36,leftMargin=36,topMargin=36,bottomMargin=36)
    styles=getSampleStyleSheet(); story=[Paragraph(title,styles['Title']),Spacer(1,12),Paragraph(summary.replace('&','&amp;'),styles['BodyText']),Spacer(1,16)]
    if columns:
        data=[columns]+[[str(v)[:80] for v in r] for r in rows[:30]]
        t=Table(data,repeatRows=1); t.setStyle(TableStyle([('BACKGROUND',(0,0),(-1,0),colors.HexColor('#111827')),('TEXTCOLOR',(0,0),(-1,0),colors.white),('GRID',(0,0),(-1,-1),0.25,colors.grey),('FONTSIZE',(0,0),(-1,-1),7),('VALIGN',(0,0),(-1,-1),'TOP')]))
        story.append(t)
    doc.build(story); buf.seek(0); return buf.getvalue()
