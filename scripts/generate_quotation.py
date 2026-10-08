import os
import docx
from docx.shared import Inches, Pt, RGBColor
from docx.enum.text import WD_ALIGN_PARAGRAPH
from docx.enum.table import WD_TABLE_ALIGNMENT, WD_ALIGN_VERTICAL
from docx.oxml import OxmlElement, parse_xml
from docx.oxml.ns import qn, nsdecls

def create_styled_document():
    doc = docx.Document()
    
    # Page setup - Standard US Letter with 0.65in top/bottom, 0.75in left/right margins
    for section in doc.sections:
        section.top_margin = Inches(0.65)
        section.bottom_margin = Inches(0.65)
        section.left_margin = Inches(0.75)
        section.right_margin = Inches(0.75)
        section.page_width = Inches(8.5)
        section.page_height = Inches(11.0)
        
        # Add subtle footer
        footer = section.footer
        p_foot = footer.paragraphs[0]
        p_foot.alignment = WD_ALIGN_PARAGRAPH.RIGHT
        p_foot.paragraph_format.space_before = Pt(0)
        p_foot.paragraph_format.space_after = Pt(0)
        r_f1 = p_foot.add_run("GPS Projects Private Limited  |  Corporate Website Proposal & Quotation  |  Ref: QT-GPS-2026-001")
        r_f1.font.name = "Calibri"
        r_f1.font.size = Pt(8)
        r_f1.font.color.rgb = RGBColor(0x94, 0xA3, 0xB8)
    
    # Configure Normal Style
    normal_style = doc.styles['Normal']
    normal_style.font.name = 'Calibri'
    normal_style.font.size = Pt(9.5)
    normal_style.font.color.rgb = RGBColor(0x33, 0x41, 0x55) # Slate 700
    normal_style.paragraph_format.line_spacing = 1.15
    normal_style.paragraph_format.space_after = Pt(2.5)

    return doc

def set_cell_shading(cell, color_hex):
    tcPr = cell._tc.get_or_add_tcPr()
    for existing in tcPr.findall(qn('w:shd')):
        tcPr.remove(existing)
    shd = parse_xml(f'<w:shd {nsdecls("w")} w:fill="{color_hex}"/>')
    tcPr.append(shd)

def set_cell_margins(cell, top=100, bottom=100, left=140, right=140):
    tcPr = cell._tc.get_or_add_tcPr()
    for existing in tcPr.findall(qn('w:tcMar')):
        tcPr.remove(existing)
    tcMar = parse_xml(
        f'<w:tcMar {nsdecls("w")}>'
        f'<w:top w:w="{top}" w:type="dxa"/>'
        f'<w:bottom w:w="{bottom}" w:type="dxa"/>'
        f'<w:left w:w="{left}" w:type="dxa"/>'
        f'<w:right w:w="{right}" w:type="dxa"/>'
        f'</w:tcMar>'
    )
    tcPr.append(tcMar)

def set_cell_borders(cell, top=None, bottom=None, left=None, right=None):
    tcPr = cell._tc.get_or_add_tcPr()
    for existing in tcPr.findall(qn('w:tcBorders')):
        tcPr.remove(existing)
    
    borders = ['<w:tcBorders ' + nsdecls("w") + '>']
    border_dict = {'top': top, 'bottom': bottom, 'left': left, 'right': right}
    for b_name, b_val in border_dict.items():
        if b_val:
            val = b_val.get('val', 'single')
            color = b_val.get('color', 'E2E8F0')
            sz = b_val.get('sz', '4')
            borders.append(f'<w:{b_name} w:val="{val}" w:sz="{sz}" w:space="0" w:color="{color}"/>')
        else:
            borders.append(f'<w:{b_name} w:val="none"/>')
    borders.append('</w:tcBorders>')
    tcBorders = parse_xml(''.join(borders))
    tcPr.append(tcBorders)

def prevent_row_split(row):
    trPr = row._tr.get_or_add_trPr()
    cantSplit = parse_xml(f'<w:cantSplit {nsdecls("w")}/>')
    trPr.append(cantSplit)

def set_table_header(row):
    trPr = row._tr.get_or_add_trPr()
    tblHeader = parse_xml(f'<w:tblHeader {nsdecls("w")}/>')
    trPr.append(tblHeader)
    prevent_row_split(row)

def add_section_header(doc, title, subtitle=None, space_before=12):
    p = doc.add_paragraph()
    p.paragraph_format.space_before = Pt(space_before)
    p.paragraph_format.space_after = Pt(3)
    p.paragraph_format.keep_with_next = True
    
    run = p.add_run(title)
    run.font.name = "Calibri"
    run.font.size = Pt(11.5)
    run.font.bold = True
    run.font.color.rgb = RGBColor(0x0F, 0x2A, 0x5C) # Deep Navy
    
    # Bottom accent rule
    pPr = p._p.get_or_add_pPr()
    pBdr = parse_xml(f'<w:pBdr {nsdecls("w")}><w:bottom w:val="single" w:sz="12" w:space="3" w:color="1E3A8A"/></w:pBdr>')
    pPr.append(pBdr)
    
    if subtitle:
        sub_p = doc.add_paragraph()
        sub_p.paragraph_format.space_before = Pt(1.5)
        sub_p.paragraph_format.space_after = Pt(4)
        sub_p.paragraph_format.keep_with_next = True
        sub_run = sub_p.add_run(subtitle)
        sub_run.font.name = "Calibri"
        sub_run.font.size = Pt(8.5)
        sub_run.font.italic = True
        sub_run.font.color.rgb = RGBColor(0x64, 0x74, 0x8B)

def build_docx_quotation():
    doc = create_styled_document()
    
    # ==========================================
    # 1. HEADER (LOGO & DOCUMENT TITLE)
    # ==========================================
    header_table = doc.add_table(rows=1, cols=2)
    header_table.alignment = WD_TABLE_ALIGNMENT.CENTER
    header_table.autofit = False
    header_table.columns[0].width = Inches(3.7)
    header_table.columns[1].width = Inches(3.3)
    
    cell_left = header_table.cell(0, 0)
    cell_right = header_table.cell(0, 1)
    cell_left.width = Inches(3.7)
    cell_right.width = Inches(3.3)
    
    set_cell_margins(cell_left, top=30, bottom=30, left=30, right=30)
    set_cell_margins(cell_right, top=30, bottom=30, left=30, right=30)
    set_cell_borders(cell_left)
    set_cell_borders(cell_right)
    prevent_row_split(header_table.rows[0])
    
    # Left: Logo & Company Name
    p_logo = cell_left.paragraphs[0]
    p_logo.paragraph_format.space_after = Pt(2)
    logo_path = os.path.abspath("public/logo-transparent.png")
    if os.path.exists(logo_path):
        run_logo = p_logo.add_run()
        run_logo.add_picture(logo_path, width=Inches(2.0))
    
    p_tag = cell_left.add_paragraph()
    p_tag.paragraph_format.space_before = Pt(1)
    p_tag.paragraph_format.space_after = Pt(0)
    r_tag = p_tag.add_run("GPS PROJECTS PRIVATE LIMITED")
    r_tag.font.size = Pt(9.5)
    r_tag.font.bold = True
    r_tag.font.color.rgb = RGBColor(0x1E, 0x29, 0x3B)
    
    p_motto = cell_left.add_paragraph()
    p_motto.paragraph_format.space_after = Pt(0)
    r_motto = p_motto.add_run("Civil Construction & Infrastructure  |  Building a Better Tomorrow")
    r_motto.font.size = Pt(8)
    r_motto.font.color.rgb = RGBColor(0x64, 0x74, 0x8B)
    
    # Right: Quotation Title & Meta Box
    p_title = cell_right.paragraphs[0]
    p_title.alignment = WD_ALIGN_PARAGRAPH.RIGHT
    p_title.paragraph_format.space_after = Pt(1)
    r_title = p_title.add_run("COMMERCIAL QUOTATION")
    r_title.font.size = Pt(15.5)
    r_title.font.bold = True
    r_title.font.color.rgb = RGBColor(0x0F, 0x2A, 0x5C)
    
    p_sub = cell_right.add_paragraph()
    p_sub.alignment = WD_ALIGN_PARAGRAPH.RIGHT
    p_sub.paragraph_format.space_after = Pt(5)
    r_sub = p_sub.add_run("Corporate Website & CMS Platform")
    r_sub.font.size = Pt(9)
    r_sub.font.color.rgb = RGBColor(0x25, 0x63, 0xEB) # Blue
    r_sub.font.bold = True
    
    meta_p = cell_right.add_paragraph()
    meta_p.alignment = WD_ALIGN_PARAGRAPH.RIGHT
    meta_p.paragraph_format.space_after = Pt(1)
    
    def add_meta_line(p, label, val, is_bold=False):
        r1 = p.add_run(f"{label}: ")
        r1.font.size = Pt(8.5)
        r1.font.bold = True
        r1.font.color.rgb = RGBColor(0x47, 0x55, 0x69)
        r2 = p.add_run(f"{val}\n")
        r2.font.size = Pt(8.5)
        r2.font.bold = is_bold
        r2.font.color.rgb = RGBColor(0x0F, 0x17, 0x2A) if is_bold else RGBColor(0x33, 0x41, 0x55)

    add_meta_line(meta_p, "Quotation Ref", "QT-GPS-2026-001", is_bold=True)
    add_meta_line(meta_p, "Date of Issue", "08 October 2026")
    add_meta_line(meta_p, "Validity Period", "15 Days (Valid until: 23 Oct 2026)", is_bold=True)
    
    # Horizontal divider
    p_div = doc.add_paragraph()
    p_div.paragraph_format.space_before = Pt(3)
    p_div.paragraph_format.space_after = Pt(6)
    pPr = p_div._p.get_or_add_pPr()
    pBdr = parse_xml(f'<w:pBdr {nsdecls("w")}><w:bottom w:val="single" w:sz="6" w:space="1" w:color="CBD5E1"/></w:pBdr>')
    pPr.append(pBdr)
    
    # ==========================================
    # 2. CLIENT & SERVICE PROVIDER CARDS
    # ==========================================
    parties_tbl = doc.add_table(rows=1, cols=2)
    parties_tbl.alignment = WD_TABLE_ALIGNMENT.CENTER
    parties_tbl.autofit = False
    parties_tbl.columns[0].width = Inches(3.45)
    parties_tbl.columns[1].width = Inches(3.45)
    prevent_row_split(parties_tbl.rows[0])
    
    c_client = parties_tbl.cell(0, 0)
    c_provider = parties_tbl.cell(0, 1)
    c_client.width = Inches(3.45)
    c_provider.width = Inches(3.45)
    
    set_cell_shading(c_client, "F8FAFC")
    set_cell_shading(c_provider, "F8FAFC")
    set_cell_margins(c_client, top=120, bottom=120, left=140, right=140)
    set_cell_margins(c_provider, top=120, bottom=120, left=140, right=140)
    
    border_spec = {'val': 'single', 'color': 'E2E8F0', 'sz': '4'}
    set_cell_borders(c_client, top=border_spec, bottom=border_spec, left=border_spec, right=border_spec)
    set_cell_borders(c_provider, top=border_spec, bottom=border_spec, left=border_spec, right=border_spec)
    
    # Client Card
    p_cl = c_client.paragraphs[0]
    p_cl.paragraph_format.space_after = Pt(2)
    r_cl_head = p_cl.add_run("PREPARED FOR (CLIENT)")
    r_cl_head.font.size = Pt(8.5)
    r_cl_head.font.bold = True
    r_cl_head.font.color.rgb = RGBColor(0x1E, 0x3A, 0x8A)
    
    p_cl_name = c_client.add_paragraph()
    p_cl_name.paragraph_format.space_after = Pt(2)
    r_cl_name = p_cl_name.add_run("GPS Projects Private Limited")
    r_cl_name.font.size = Pt(9.5)
    r_cl_name.font.bold = True
    r_cl_name.font.color.rgb = RGBColor(0x0F, 0x17, 0x2A)
    
    p_cl_details = c_client.add_paragraph()
    p_cl_details.paragraph_format.space_after = Pt(0)
    p_cl_details.paragraph_format.line_spacing = 1.15
    cl_runs = [
        ("CIN: ", True), ("U41001UW2026PTC258583 (ROC UP II)\n", False),
        ("Address: ", True), ("House No. 138, Pipal Adda, Etah, UP - 207001\n", False),
        ("Industry: ", True), ("Civil Construction & Infrastructure\n", False),
        ("Directors: ", True), ("Chirag Rajput / Rahul Verma", False)
    ]
    for txt, is_b in cl_runs:
        r = p_cl_details.add_run(txt)
        r.font.size = Pt(8)
        r.font.bold = is_b
        r.font.color.rgb = RGBColor(0x33, 0x41, 0x55)
        
    # Provider Card
    p_pr = c_provider.paragraphs[0]
    p_pr.paragraph_format.space_after = Pt(2)
    r_pr_head = p_pr.add_run("PREPARED BY (SERVICE PROVIDER)")
    r_pr_head.font.size = Pt(8.5)
    r_pr_head.font.bold = True
    r_pr_head.font.color.rgb = RGBColor(0x1E, 0x3A, 0x8A)
    
    p_pr_name = c_provider.add_paragraph()
    p_pr_name.paragraph_format.space_after = Pt(2)
    r_pr_name = p_pr_name.add_run("Akshit Mahajan")
    r_pr_name.font.size = Pt(9.5)
    r_pr_name.font.bold = True
    r_pr_name.font.color.rgb = RGBColor(0x0F, 0x17, 0x2A)
    
    p_pr_details = c_provider.add_paragraph()
    p_pr_details.paragraph_format.space_after = Pt(0)
    p_pr_details.paragraph_format.line_spacing = 1.15
    pr_runs = [
        ("Designation: ", True), ("Lead Full-Stack Web Engineer & Consultant\n", False),
        ("Architecture: ", True), ("Next.js 16, React 19, TypeScript, MongoDB\n", False),
        ("Email: ", True), ("hello@gpsprimeprojects.in\n", False),
        ("Preview URL: ", True), ("https://gps-one-opal.vercel.app", False)
    ]
    for txt, is_b in pr_runs:
        r = p_pr_details.add_run(txt)
        r.font.size = Pt(8)
        r.font.bold = is_b
        r.font.color.rgb = RGBColor(0x33, 0x41, 0x55)

    # ==========================================
    # 3. EXECUTIVE SUMMARY
    # ==========================================
    add_section_header(doc, "1. PROJECT OBJECTIVE & EXECUTIVE SUMMARY", space_before=10)
    p_exec = doc.add_paragraph()
    p_exec.paragraph_format.space_after = Pt(3)
    p_exec.paragraph_format.line_spacing = 1.15
    p_exec.add_run(
        "This commercial quotation presents the comprehensive deliverables, technical architecture, hosting infrastructure "
        "ownership, and financial investment for the complete design, engineering, and deployment of a modern corporate website "
        "for "
    )
    r_bc = p_exec.add_run("GPS Projects Private Limited")
    r_bc.bold = True
    p_exec.add_run(
        ". The platform is custom-built to establish an authoritative digital presence in the regional construction sector, "
        "showcase ongoing and completed residential, commercial, and industrial projects, capture qualified client inquiries "
        "with instant email dispatch, and empower internal staff with a dedicated, no-code Content Management System (CMS) "
        "to update project listings in real time."
    )

    # ==========================================
    # 4. SCOPE OF SERVICES & DELIVERABLES
    # ==========================================
    add_section_header(doc, "2. DETAILED SCOPE OF SERVICES & DELIVERABLES", space_before=10)
    
    def add_scope_item(title, desc_lines):
        p_item = doc.add_paragraph()
        p_item.paragraph_format.space_before = Pt(2)
        p_item.paragraph_format.space_after = Pt(1.5)
        p_item.paragraph_format.line_spacing = 1.15
        
        r_bullet = p_item.add_run("•  ")
        r_bullet.font.size = Pt(8.5)
        r_bullet.font.bold = True
        r_bullet.font.color.rgb = RGBColor(0x25, 0x63, 0xEB)
        
        r_head = p_item.add_run(title + ": ")
        r_head.bold = True
        r_head.font.color.rgb = RGBColor(0x0F, 0x17, 0x2A)
        
        r_desc = p_item.add_run(desc_lines)
        r_desc.font.color.rgb = RGBColor(0x33, 0x41, 0x55)

    add_scope_item(
        "Bespoke Responsive UI/UX Architecture",
        "Engineered on Next.js 16 and React 19 with a mobile-first design system. Perfectly adapted for smartphones, tablets, laptops, and 4K displays, adhering strictly to GPS corporate branding, high-resolution imagery, and modern typography."
    )
    add_scope_item(
        "6 Core Corporate Pages & Functional Sections",
        "Home (hero brand message, live counters, service previews, portfolio showcase, contact triggers), About Us (incorporation credentials, ROC UP II registration, mission, leadership profiles), Services (detailed breakdown of Residential, Commercial & Industrial Construction), Projects Portfolio (categorized dynamic listings), Photo Gallery (interactive lightbox viewer), and Contact Us (verified corporate address, direct phone/email actions, and inquiry form)."
    )
    add_scope_item(
        "Lead Capture & Automated Email Notification System",
        "Interactive customer inquiry form with client & server-side validation, anti-spam honeypot shielding, and automatic SMTP email forwarding dispatching client inquiries directly to company management."
    )
    add_scope_item(
        "Dynamic Admin Content Management System (CMS)",
        "Secure administrative portal (/admin) empowering company staff to add, update, or archive project details, images, specifications, completion stages, and locations without writing code."
    )
    add_scope_item(
        "Search Engine Optimization (SEO) & Social Sharing Integration",
        "Production-grade SEO architecture including Schema.org JSON-LD structured data (Corporate Entity & Postal Address schema), automated dynamic XML sitemap (/sitemap.xml), robots.txt crawler directives, and branded OpenGraph preview cards for WhatsApp and social sharing."
    )
    add_scope_item(
        "Performance Optimization, SSL Encryption & Multi-Browser QA",
        "Instantaneous page loading via server-side rendering, asset compression, SSL/TLS HTTPS encryption, and rigorous cross-browser testing on Google Chrome, Apple Safari, Microsoft Edge, Mozilla Firefox, and mobile browsers."
    )

    # PAGE BREAK TO ENSURE CLEAN 2-PAGE PROFESSIONAL LAYOUT
    doc.add_page_break()

    # ==========================================
    # 5. INFRASTRUCTURE & OWNERSHIP BREAKDOWN
    # ==========================================
    add_section_header(
        doc,
        "3. INFRASTRUCTURE, HOSTING & DOMAIN OWNERSHIP",
        "Transparent operational breakdown guaranteeing zero recurring server/hosting fees for the client",
        space_before=4
    )
    
    infra_tbl = doc.add_table(rows=3, cols=3)
    infra_tbl.alignment = WD_TABLE_ALIGNMENT.CENTER
    infra_tbl.autofit = False
    
    col_widths = [Inches(1.8), Inches(1.8), Inches(3.4)]
    for i, w in enumerate(col_widths):
        infra_tbl.columns[i].width = w

    headers = ["Infrastructure Component", "Cost Responsibility", "Scope & Management Details"]
    for j, h_text in enumerate(headers):
        c = infra_tbl.cell(0, j)
        c.width = col_widths[j]
        set_cell_shading(c, "0F2A5C") # Navy
        set_cell_margins(c, top=80, bottom=80, left=100, right=100)
        set_cell_borders(c, bottom={'val': 'single', 'color': '0F172A', 'sz': '8'})
        p = c.paragraphs[0]
        p.alignment = WD_ALIGN_PARAGRAPH.CENTER if j == 1 else WD_ALIGN_PARAGRAPH.LEFT
        r = p.add_run(h_text)
        r.font.size = Pt(8.5)
        r.font.bold = True
        r.font.color.rgb = RGBColor(0xFF, 0xFF, 0xFF)
    set_table_header(infra_tbl.rows[0])

    row1 = [
        ("Cloud Web Hosting &\nMongoDB Database", True),
        ("BORNE BY SERVICE PROVIDER\n(100% COMPLIMENTARY)", True),
        ("All production cloud web hosting, serverless compute runtime, and cloud database (MongoDB) infrastructure charges are fully provided and borne by the Service Provider at zero recurring cost to GPS Projects Private Limited. Includes SSL/TLS certificate setup and automatic renewals.\nClient Savings: Approx. ₹6,000 - ₹12,000 / year in recurring server bills.", False)
    ]
    for j, (text, is_bold) in enumerate(row1):
        c = infra_tbl.cell(1, j)
        c.width = col_widths[j]
        set_cell_shading(c, "F0FDF4") # Subtle light green
        set_cell_margins(c, top=100, bottom=100, left=100, right=100)
        b_spec = {'val': 'single', 'color': 'BBF7D0', 'sz': '4'}
        set_cell_borders(c, top=b_spec, bottom=b_spec, left=b_spec, right=b_spec)
        p = c.paragraphs[0]
        p.paragraph_format.line_spacing = 1.15
        p.alignment = WD_ALIGN_PARAGRAPH.CENTER if j == 1 else WD_ALIGN_PARAGRAPH.LEFT
        r = p.add_run(text)
        r.font.size = Pt(8)
        r.font.bold = is_bold
        if j == 1:
            r.font.color.rgb = RGBColor(0x16, 0x65, 0x34) # Green
        elif j == 0:
            r.font.color.rgb = RGBColor(0x0F, 0x17, 0x2A)
        else:
            r.font.color.rgb = RGBColor(0x33, 0x41, 0x55)
    prevent_row_split(infra_tbl.rows[1])

    row2 = [
        ("Domain Name\nRegistration & Renewals", True),
        ("BORNE BY CLIENT\n(CUSTOMER RESPONSIBILITY)", True),
        ("GPS Projects Private Limited will bear the annual domain registration fees directly through their preferred registrar (e.g., GoDaddy, Namecheap, Hostinger) or reimburse at actual registrar cost (~₹800 - ₹1,200/yr).\nService Provider Scope: Complete DNS records routing (A, CNAME, TXT), domain mapping, and SSL binding performed at zero additional charge.", False)
    ]
    for j, (text, is_bold) in enumerate(row2):
        c = infra_tbl.cell(2, j)
        c.width = col_widths[j]
        set_cell_shading(c, "FFFFFF")
        set_cell_margins(c, top=100, bottom=100, left=100, right=100)
        b_spec = {'val': 'single', 'color': 'E2E8F0', 'sz': '4'}
        set_cell_borders(c, top=b_spec, bottom=b_spec, left=b_spec, right=b_spec)
        p = c.paragraphs[0]
        p.paragraph_format.line_spacing = 1.15
        p.alignment = WD_ALIGN_PARAGRAPH.CENTER if j == 1 else WD_ALIGN_PARAGRAPH.LEFT
        r = p.add_run(text)
        r.font.size = Pt(8)
        r.font.bold = is_bold
        if j == 1:
            r.font.color.rgb = RGBColor(0x9A, 0x34, 0x12) # Amber/Brown
        elif j == 0:
            r.font.color.rgb = RGBColor(0x0F, 0x17, 0x2A)
        else:
            r.font.color.rgb = RGBColor(0x33, 0x41, 0x55)
    prevent_row_split(infra_tbl.rows[2])

    # ==========================================
    # 6. FINANCIAL INVESTMENT SUMMARY
    # ==========================================
    add_section_header(doc, "4. COMMERCIAL INVESTMENT & FINANCIAL SUMMARY", space_before=10)
    
    fin_tbl = doc.add_table(rows=7, cols=4)
    fin_tbl.alignment = WD_TABLE_ALIGNMENT.CENTER
    fin_tbl.autofit = False
    
    col_w_fin = [Inches(0.55), Inches(3.65), Inches(1.6), Inches(1.2)]
    for i, w in enumerate(col_w_fin):
        fin_tbl.columns[i].width = w

    fin_headers = ["S.No", "Deliverable / Service Component", "Cost Responsibility", "Amount (INR)"]
    for j, h_text in enumerate(fin_headers):
        c = fin_tbl.cell(0, j)
        c.width = col_w_fin[j]
        set_cell_shading(c, "0F2A5C") # Navy
        set_cell_margins(c, top=80, bottom=80, left=90, right=90)
        set_cell_borders(c, bottom={'val': 'single', 'color': '0F172A', 'sz': '8'})
        p = c.paragraphs[0]
        p.alignment = WD_ALIGN_PARAGRAPH.CENTER if j in [0, 2, 3] else WD_ALIGN_PARAGRAPH.LEFT
        r = p.add_run(h_text)
        r.font.size = Pt(8.5)
        r.font.bold = True
        r.font.color.rgb = RGBColor(0xFF, 0xFF, 0xFF)
    set_table_header(fin_tbl.rows[0])

    items = [
        ("01", "Full-Stack Corporate Website Development\n• Custom responsive UI/UX (Next.js 16 + React 19)\n• 6 Core Pages (Home, About, Services, Projects, Gallery, Contact)\n• Automated Lead Capture & SMTP Email Notifications\n• Complete Search Engine Optimization (SEO & JSON-LD)", "One-Time Development Fee", "₹8,000/-"),
        ("02", "Dynamic Admin CMS Portal (/admin)\n• No-code dashboard to add/update project listings & images\n• Real-time database synchronization", "Included in Development Fee", "₹0 (Included)"),
        ("03", "Production Cloud Web Hosting\n• High-performance edge cloud hosting & 99.9% uptime SLA", "Borne by Service Provider", "₹0 (Complimentary)"),
        ("04", "Cloud Database Infrastructure (MongoDB)\n• Secure managed cloud database for CMS records & inquiries", "Borne by Service Provider", "₹0 (Complimentary)"),
        ("05", "SSL Security Certificate (HTTPS Encryption)\n• Automated configuration, HTTPS redirect & yearly renewals", "Borne by Service Provider", "₹0 (Complimentary)"),
        ("06", "Official Domain Name Registration & Annual Renewals\n• Official corporate domain purchased directly via registrar\n• Full DNS record routing and configuration provided by developer", "Borne by Customer\n(Client Responsibility)", "At Actuals\n(~₹800 - ₹1,200/yr)")
    ]

    for row_idx, item_data in enumerate(items, start=1):
        bg = "F8FAFC" if row_idx % 2 == 1 else "FFFFFF"
        if row_idx in [3, 4, 5]:
            bg = "F0FDF4"
            
        for col_idx, text in enumerate(item_data):
            c = fin_tbl.cell(row_idx, col_idx)
            c.width = col_w_fin[col_idx]
            set_cell_shading(c, bg)
            set_cell_margins(c, top=70, bottom=70, left=90, right=90)
            b_spec = {'val': 'single', 'color': 'E2E8F0', 'sz': '4'}
            set_cell_borders(c, top=b_spec, bottom=b_spec, left=b_spec, right=b_spec)
            p = c.paragraphs[0]
            p.paragraph_format.line_spacing = 1.15
            p.alignment = WD_ALIGN_PARAGRAPH.CENTER if col_idx in [0, 2, 3] else WD_ALIGN_PARAGRAPH.LEFT
            
            if col_idx == 1 and "\n" in text:
                p.text = ""
                lines = text.split("\n", 1)
                r1 = p.add_run(lines[0] + "\n")
                r1.font.size = Pt(8)
                r1.font.bold = True
                r1.font.color.rgb = RGBColor(0x0F, 0x17, 0x2A)
                r2 = p.add_run(lines[1])
                r2.font.size = Pt(7.5)
                r2.font.color.rgb = RGBColor(0x47, 0x55, 0x69)
            elif col_idx == 3:
                r = p.add_run(text)
                r.font.size = Pt(8)
                r.font.bold = True
                if "₹8,000" in text:
                    r.font.color.rgb = RGBColor(0x0F, 0x17, 0x2A)
                    r.font.size = Pt(8.5)
                elif "Complimentary" in text or "Included" in text:
                    r.font.color.rgb = RGBColor(0x16, 0x65, 0x34)
                else:
                    r.font.color.rgb = RGBColor(0x64, 0x74, 0x8B)
            else:
                r = p.add_run(text)
                r.font.size = Pt(8)
                if col_idx == 0:
                    r.font.bold = True
                    r.font.color.rgb = RGBColor(0x64, 0x74, 0x8B)
                else:
                    r.font.color.rgb = RGBColor(0x33, 0x41, 0x55)
        prevent_row_split(fin_tbl.rows[row_idx])

    # Total Investment Row Card
    tot_tbl = doc.add_table(rows=1, cols=2)
    tot_tbl.alignment = WD_TABLE_ALIGNMENT.CENTER
    tot_tbl.autofit = False
    tot_tbl.columns[0].width = Inches(4.8)
    tot_tbl.columns[1].width = Inches(2.2)
    prevent_row_split(tot_tbl.rows[0])
    
    c_tot_left = tot_tbl.cell(0, 0)
    c_tot_right = tot_tbl.cell(0, 1)
    c_tot_left.width = Inches(4.8)
    c_tot_right.width = Inches(2.2)
    
    set_cell_shading(c_tot_left, "0F2A5C")
    set_cell_shading(c_tot_right, "1E3A8A")
    set_cell_margins(c_tot_left, top=80, bottom=80, left=120, right=120)
    set_cell_margins(c_tot_right, top=80, bottom=80, left=120, right=120)
    
    p_tl = c_tot_left.paragraphs[0]
    p_tl.paragraph_format.space_after = Pt(0)
    rtl1 = p_tl.add_run("TOTAL FIXED INVESTMENT PAYABLE TO SERVICE PROVIDER:\n")
    rtl1.font.size = Pt(8)
    rtl1.font.bold = True
    rtl1.font.color.rgb = RGBColor(0x93, 0xC5, 0xFD) # Sky Blue
    rtl2 = p_tl.add_run("INR ₹8,000/- (Indian Rupees Eight Thousand Only)")
    rtl2.font.size = Pt(10.5)
    rtl2.font.bold = True
    rtl2.font.color.rgb = RGBColor(0xFF, 0xFF, 0xFF)
    
    p_tr = c_tot_right.paragraphs[0]
    p_tr.paragraph_format.space_after = Pt(0)
    p_tr.alignment = WD_ALIGN_PARAGRAPH.RIGHT
    rtr1 = p_tr.add_run("TOTAL INVESTMENT\n")
    rtr1.font.size = Pt(7.5)
    rtr1.font.bold = True
    rtr1.font.color.rgb = RGBColor(0x93, 0xC5, 0xFD)
    rtr2 = p_tr.add_run("₹8,000")
    rtr2.font.size = Pt(15)
    rtr2.font.bold = True
    rtr2.font.color.rgb = RGBColor(0xFF, 0xFF, 0xFF)

    # ==========================================
    # 7. COMMERCIAL TERMS & TIMELINE
    # ==========================================
    add_section_header(doc, "5. COMMERCIAL TERMS & PROJECT CONDITIONS", space_before=10)
    
    terms = [
        ("Payment Milestones", "The fixed fee of ₹8,000/- is payable across two milestones: 50% Mobilization Advance (₹4,000) upon project acceptance and work commencement; 50% Final Settlement (₹4,000) upon final staging review, client sign-off, and live production domain launch."),
        ("Turnaround Timeline", "Standard project completion is 7 to 10 business days from receipt of initial mobilization advance and necessary corporate media assets."),
        ("Domain Registrar Responsibility", "GPS Projects Private Limited shall purchase the official domain directly or reimburse the registrar invoice at exact actual cost. Recurring annual renewals remain the responsibility of the client. DNS mapping, record routing, and SSL linking are included at zero developer fee."),
        ("Hosting & Database Commitment", "All production web hosting and cloud database infrastructure are borne by the Service Provider with no recurring infrastructure bills charged to the client."),
        ("Warranty & Post-Launch Support", "Includes 30 calendar days of complimentary technical support post-deployment covering bug resolution, display adjustments, and admin panel guidance."),
        ("Client Responsibilities", "Prompt delivery of brand logos, verified project photos, company copy, and registrar credentials for seamless DNS mapping."),
        ("Scope Amendments", "Any advanced functionality requested outside the outlined 6 pages (e.g., payment gateway, custom accounting ERP integrations) will be estimated under a separate change order.")
    ]

    for title, desc in terms:
        p_t = doc.add_paragraph()
        p_t.paragraph_format.space_before = Pt(1.5)
        p_t.paragraph_format.space_after = Pt(1.5)
        p_t.paragraph_format.line_spacing = 1.15
        
        r_num = p_t.add_run("•  ")
        r_num.font.bold = True
        r_num.font.color.rgb = RGBColor(0x25, 0x63, 0xEB)
        
        r_t_head = p_t.add_run(f"{title}: ")
        r_t_head.bold = True
        r_t_head.font.color.rgb = RGBColor(0x0F, 0x17, 0x2A)
        
        r_t_desc = p_t.add_run(desc)
        r_t_desc.font.color.rgb = RGBColor(0x33, 0x41, 0x55)

    # ==========================================
    # 8. ACCEPTANCE & AUTHORIZATION
    # ==========================================
    add_section_header(
        doc,
        "6. ACCEPTANCE & PROJECT AUTHORIZATION",
        "Sign below to accept this quotation and authorize commencement under the outlined commercial terms",
        space_before=10
    )
    
    sign_tbl = doc.add_table(rows=1, cols=2)
    sign_tbl.alignment = WD_TABLE_ALIGNMENT.CENTER
    sign_tbl.autofit = False
    sign_tbl.columns[0].width = Inches(3.45)
    sign_tbl.columns[1].width = Inches(3.45)
    prevent_row_split(sign_tbl.rows[0])
    
    s_client = sign_tbl.cell(0, 0)
    s_provider = sign_tbl.cell(0, 1)
    s_client.width = Inches(3.45)
    s_provider.width = Inches(3.45)
    
    set_cell_shading(s_client, "F8FAFC")
    set_cell_shading(s_provider, "F8FAFC")
    set_cell_margins(s_client, top=100, bottom=100, left=130, right=130)
    set_cell_margins(s_provider, top=100, bottom=100, left=130, right=130)
    
    b_spec = {'val': 'single', 'color': 'CBD5E1', 'sz': '4'}
    set_cell_borders(s_client, top=b_spec, bottom=b_spec, left=b_spec, right=b_spec)
    set_cell_borders(s_provider, top=b_spec, bottom=b_spec, left=b_spec, right=b_spec)
    
    # Client Sign Box
    p_sc = s_client.paragraphs[0]
    p_sc.paragraph_format.space_after = Pt(1.5)
    r_sc = p_sc.add_run("FOR: GPS PROJECTS PRIVATE LIMITED")
    r_sc.font.size = Pt(8.5)
    r_sc.font.bold = True
    r_sc.font.color.rgb = RGBColor(0x0F, 0x2A, 0x5C)
    
    p_sc_sub = s_client.add_paragraph()
    p_sc_sub.paragraph_format.space_after = Pt(16)
    r_sc_sub = p_sc_sub.add_run("Authorized Client Signatory")
    r_sc_sub.font.size = Pt(8)
    r_sc_sub.font.color.rgb = RGBColor(0x64, 0x74, 0x8B)
    
    p_sc_lines = s_client.add_paragraph()
    p_sc_lines.paragraph_format.space_after = Pt(0)
    p_sc_lines.paragraph_format.line_spacing = 1.25
    lines_c = [
        ("Signature:  ", True), ("___________________________________\n", False),
        ("Name:         ", True), ("___________________________________\n", False),
        ("Designation: ", True), ("Director / Authorized Signatory\n", False),
        ("Date:            ", True), ("____ / ____ / 2026", False)
    ]
    for lbl, is_b in lines_c:
        r = p_sc_lines.add_run(lbl)
        r.font.size = Pt(8)
        r.font.bold = is_b
        r.font.color.rgb = RGBColor(0x33, 0x41, 0x55)

    # Provider Sign Box
    p_sp = s_provider.paragraphs[0]
    p_sp.paragraph_format.space_after = Pt(1.5)
    r_sp = p_sp.add_run("FOR: SERVICE PROVIDER")
    r_sp.font.size = Pt(8.5)
    r_sp.font.bold = True
    r_sp.font.color.rgb = RGBColor(0x0F, 0x2A, 0x5C)
    
    p_sp_sub = s_provider.add_paragraph()
    p_sp_sub.paragraph_format.space_after = Pt(16)
    r_sp_sub = p_sp_sub.add_run("Lead Full-Stack Web Engineer")
    r_sp_sub.font.size = Pt(8)
    r_sp_sub.font.color.rgb = RGBColor(0x64, 0x74, 0x8B)
    
    p_sp_lines = s_provider.add_paragraph()
    p_sp_lines.paragraph_format.space_after = Pt(0)
    p_sp_lines.paragraph_format.line_spacing = 1.25
    lines_p = [
        ("Signature:  ", True), ("___________________________________\n", False),
        ("Name:         ", True), ("Akshit Mahajan\n", False),
        ("Designation: ", True), ("Lead Web Engineering & Consultant\n", False),
        ("Date:            ", True), ("08 / 10 / 2026", False)
    ]
    for lbl, is_b in lines_p:
        r = p_sp_lines.add_run(lbl)
        r.font.size = Pt(8)
        r.font.bold = is_b
        r.font.color.rgb = RGBColor(0x33, 0x41, 0x55)
        
    output_filename = "Quotation - GPS Projects Private Limited.docx"
    doc.save(output_filename)
    print(f"[OK] Generated Word Document: {output_filename}")

def build_html_quotation():
    """Generates an executive, print-ready HTML edition of the quotation."""
    html_content = """<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Commercial Quotation — GPS Projects Private Limited</title>
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&display=swap" rel="stylesheet">
  <style>
    :root {
      --primary: #0f2a5c;
      --primary-light: #1e3a8a;
      --accent: #2563eb;
      --text-main: #0f172a;
      --text-muted: #475569;
      --text-light: #64748b;
      --border: #e2e8f0;
      --bg-card: #f8fafc;
      --green-bg: #f0fdf4;
      --green-text: #166534;
      --green-border: #bbf7d0;
      --amber-text: #9a3412;
    }

    * { box-sizing: border-box; margin: 0; padding: 0; }
    body {
      font-family: 'Plus Jakarta Sans', system-ui, -apple-system, sans-serif;
      background-color: #f1f5f9;
      color: var(--text-main);
      line-height: 1.45;
      padding: 40px 20px;
      font-size: 13.5px;
    }

    .toolbar {
      max-width: 860px;
      margin: 0 auto 20px auto;
      display: flex;
      justify-content: space-between;
      align-items: center;
    }
    .btn-print {
      background: var(--primary-light);
      color: #fff;
      border: none;
      padding: 10px 20px;
      border-radius: 8px;
      font-weight: 600;
      font-size: 14px;
      cursor: pointer;
      display: inline-flex;
      align-items: center;
      gap: 8px;
      box-shadow: 0 4px 12px rgba(37, 99, 235, 0.2);
      transition: background 0.2s;
    }
    .btn-print:hover { background: var(--primary); }

    .doc-page {
      max-width: 860px;
      margin: 0 auto 30px auto;
      background: #ffffff;
      padding: 45px 50px;
      border-radius: 12px;
      box-shadow: 0 10px 30px rgba(0,0,0,0.06);
      border: 1px solid var(--border);
    }

    .header-table {
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
      border-bottom: 2px solid var(--border);
      padding-bottom: 20px;
      margin-bottom: 22px;
    }
    .logo-container img {
      max-width: 210px;
      height: auto;
      margin-bottom: 6px;
    }
    .logo-text h2 {
      font-size: 14px;
      font-weight: 800;
      color: var(--primary);
      letter-spacing: 0.5px;
    }
    .logo-text p {
      font-size: 11.5px;
      color: var(--text-light);
      margin-top: 1px;
    }

    .quotation-badge { text-align: right; }
    .quotation-badge h1 {
      font-size: 22px;
      font-weight: 800;
      color: var(--primary);
      text-transform: uppercase;
      letter-spacing: -0.5px;
    }
    .quotation-badge .tag {
      display: inline-block;
      color: var(--accent);
      font-weight: 700;
      font-size: 12px;
      margin-top: 2px;
      margin-bottom: 8px;
    }
    .meta-list {
      font-size: 12px;
      color: var(--text-muted);
      line-height: 1.6;
    }
    .meta-list strong { color: var(--text-main); }

    .grid-2 {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 16px;
      margin-bottom: 24px;
    }
    .info-card {
      background: var(--bg-card);
      border: 1px solid var(--border);
      border-radius: 8px;
      padding: 16px;
    }
    .info-card h3 {
      font-size: 11px;
      font-weight: 800;
      color: var(--primary-light);
      text-transform: uppercase;
      letter-spacing: 0.5px;
      margin-bottom: 6px;
    }
    .info-card h4 {
      font-size: 15px;
      font-weight: 700;
      color: var(--text-main);
      margin-bottom: 6px;
    }
    .info-card p {
      font-size: 12px;
      color: var(--text-muted);
      line-height: 1.5;
    }

    .section-title {
      font-size: 15px;
      font-weight: 700;
      color: var(--primary);
      text-transform: uppercase;
      letter-spacing: 0.4px;
      padding-bottom: 6px;
      border-bottom: 2px solid var(--primary);
      margin-top: 22px;
      margin-bottom: 12px;
    }
    .section-subtitle {
      font-size: 12px;
      color: var(--text-light);
      font-style: italic;
      margin-top: -6px;
      margin-bottom: 12px;
    }

    .scope-list { list-style: none; margin-bottom: 20px; }
    .scope-item {
      display: flex;
      gap: 10px;
      font-size: 12.5px;
      margin-bottom: 8px;
      line-height: 1.5;
      color: var(--text-muted);
    }
    .scope-item .bullet {
      color: var(--accent);
      font-weight: bold;
      font-size: 14px;
      line-height: 1.2;
    }
    .scope-item strong { color: var(--text-main); }

    table {
      width: 100%;
      border-collapse: collapse;
      margin-bottom: 16px;
      font-size: 12.5px;
    }
    th {
      background: var(--primary);
      color: #fff;
      font-weight: 700;
      text-align: left;
      padding: 10px 12px;
      font-size: 11.5px;
      text-transform: uppercase;
      letter-spacing: 0.5px;
    }
    td {
      padding: 10px 12px;
      border-bottom: 1px solid var(--border);
      color: var(--text-muted);
      vertical-align: middle;
    }
    tr.green-row {
      background-color: var(--green-bg);
      border-color: var(--green-border);
    }
    .badge-green {
      display: inline-block;
      padding: 3px 8px;
      background: #dcfce7;
      color: var(--green-text);
      border-radius: 4px;
      font-size: 11px;
      font-weight: 700;
    }
    .badge-amber {
      display: inline-block;
      padding: 3px 8px;
      background: #fef3c7;
      color: var(--amber-text);
      border-radius: 4px;
      font-size: 11px;
      font-weight: 700;
    }

    .total-banner {
      background: linear-gradient(135deg, var(--primary) 0%, var(--primary-light) 100%);
      color: #fff;
      border-radius: 8px;
      padding: 16px 20px;
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 24px;
    }
    .total-banner .label {
      font-size: 12px;
      text-transform: uppercase;
      letter-spacing: 0.5px;
      color: #93c5fd;
      font-weight: 700;
    }
    .total-banner .amount-words {
      font-size: 14px;
      font-weight: 700;
      margin-top: 2px;
    }
    .total-banner .amount-num {
      font-size: 26px;
      font-weight: 800;
      color: #fff;
      text-align: right;
    }

    .terms-list {
      list-style: none;
      margin-bottom: 24px;
    }
    .terms-item {
      display: flex;
      gap: 10px;
      font-size: 12px;
      color: var(--text-muted);
      margin-bottom: 6px;
      line-height: 1.45;
    }
    .terms-item .bullet { color: var(--accent); font-weight: bold; }
    .terms-item strong { color: var(--text-main); }

    .sign-table {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 16px;
      margin-top: 10px;
    }
    .sign-box {
      background: var(--bg-card);
      border: 1px solid var(--border);
      border-radius: 8px;
      padding: 16px;
    }
    .sign-box h4 {
      font-size: 11.5px;
      font-weight: 800;
      color: var(--primary);
      text-transform: uppercase;
      letter-spacing: 0.5px;
    }
    .sign-box .role {
      font-size: 11px;
      color: var(--text-light);
      margin-bottom: 30px;
    }
    .sign-field {
      font-size: 11.5px;
      line-height: 1.8;
      color: var(--text-muted);
    }
    .sign-field strong { color: var(--text-main); }

    @media print {
      body { background: #fff; padding: 0; }
      .toolbar { display: none; }
      .doc-page {
        box-shadow: none;
        border: none;
        padding: 0;
        max-width: 100%;
        margin-bottom: 0;
      }
      .page-break { page-break-before: always; }
    }
  </style>
</head>
<body>

  <div class="toolbar">
    <div style="font-weight: 700; color: #475569; font-size: 14px;">Quotation Ref: QT-GPS-2026-001</div>
    <button class="btn-print" onclick="window.print()">
      <svg width="16" height="16" fill="currentColor" viewBox="0 0 16 16"><path d="M2.5 8a.5.5 0 1 0 0-1 .5.5 0 0 0 0 1z"/><path d="M5 1a2 2 0 0 0-2 2v2H2a2 2 0 0 0-2 2v3a2 2 0 0 0 2 2h1v1a2 2 0 0 0 2 2h6a2 2 0 0 0 2-2v-1h1a2 2 0 0 0 2-2V7a2 2 0 0 0-2-2h-1V3a2 2 0 0 0-2-2H5zM4 3a1 1 0 0 1 1-1h6a1 1 0 0 1 1 1v2H4V3zm1 5a2 2 0 0 0-2 2v1H2a1 1 0 0 1-1-1V7a1 1 0 0 1 1-1h12a1 1 0 0 1 1 1v3a1 1 0 0 1-1 1h-1v-1a2 2 0 0 0-2-2H5zm7 2v3a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1v-3a1 1 0 0 1 1-1h6a1 1 0 0 1 1 1z"/></svg>
      Print / Save as PDF
    </button>
  </div>

  <div class="doc-page">
    <!-- PAGE 1: HEADER & DELIVERABLES -->
    <div class="header-table">
      <div class="logo-container">
        <img src="public/logo-transparent.png" alt="GPS Projects Logo">
        <div class="logo-text">
          <h2>GPS PROJECTS PRIVATE LIMITED</h2>
          <p>Civil Construction & Infrastructure | Building a Better Tomorrow</p>
        </div>
      </div>
      <div class="quotation-badge">
        <h1>Quotation</h1>
        <div class="tag">Corporate Website & CMS Platform</div>
        <div class="meta-list">
          <div><strong>Quotation Ref:</strong> QT-GPS-2026-001</div>
          <div><strong>Date of Issue:</strong> 08 October 2026</div>
          <div><strong>Validity:</strong> 15 Days (Until 23 Oct 2026)</div>
        </div>
      </div>
    </div>

    <!-- CLIENT & PROVIDER CARDS -->
    <div class="grid-2">
      <div class="info-card">
        <h3>Prepared For (Client)</h3>
        <h4>GPS Projects Private Limited</h4>
        <p>
          <strong>CIN:</strong> U41001UW2026PTC258583 (ROC UP II)<br>
          <strong>Address:</strong> House No. 138, Pipal Adda, Etah, UP - 207001<br>
          <strong>Industry:</strong> Civil Construction & Infrastructure<br>
          <strong>Directors:</strong> Chirag Rajput / Rahul Verma
        </p>
      </div>
      <div class="info-card">
        <h3>Prepared By (Service Provider)</h3>
        <h4>Akshit Mahajan</h4>
        <p>
          <strong>Role:</strong> Lead Full-Stack Web Engineer & Consultant<br>
          <strong>Architecture:</strong> Next.js 16, React 19, TypeScript, MongoDB<br>
          <strong>Email:</strong> hello@gpsprimeprojects.in<br>
          <strong>Preview Staging:</strong> gps-one-opal.vercel.app
        </p>
      </div>
    </div>

    <!-- 1. OBJECTIVE -->
    <div class="section-title">1. Project Objective & Executive Summary</div>
    <p style="font-size: 12.5px; color: var(--text-muted); margin-bottom: 18px; line-height: 1.5;">
      This quotation presents the comprehensive scope, technical architecture, infrastructure cost ownership, and commercial investment for engineering and deploying a bespoke corporate website for <strong>GPS Projects Private Limited</strong>. The platform is designed to establish an authoritative digital identity, showcase residential, commercial, and industrial construction projects, drive qualified customer inquiries with instant automated email alerts, and empower company staff with a dedicated, no-code Content Management System (CMS) to manage live portfolio listings.
    </p>

    <!-- 2. SCOPE -->
    <div class="section-title">2. Detailed Scope of Services & Deliverables</div>
    <ul class="scope-list">
      <li class="scope-item">
        <span class="bullet">■</span>
        <div><strong>Bespoke Responsive UI/UX Architecture:</strong> Custom-built on Next.js 16 and React 19 with a mobile-first design system. Perfectly adapted for smartphones, tablets, laptops, and 4K displays, incorporating official corporate colors, high-resolution imagery, and clean typography.</div>
      </li>
      <li class="scope-item">
        <span class="bullet">■</span>
        <div><strong>6 Dedicated Core Corporate Pages & Sections:</strong> Homepage (hero branding, metrics counters, service previews, portfolio showcase, contact triggers), About Us (incorporation records, ROC UP II registration, mission, leadership profiles), Services (detailed breakdown of Residential, Commercial & Industrial Construction), Projects Portfolio (categorized dynamic listings), Photo Gallery (interactive lightbox viewer), and Contact Us (verified corporate address, direct phone/email actions, and inquiry form).</div>
      </li>
      <li class="scope-item">
        <span class="bullet">■</span>
        <div><strong>Lead Capture & Automated Email Notification System:</strong> Interactive customer inquiry form with client & server-side validation, anti-spam honeypot shielding, and automatic SMTP email dispatch forwarding inquiries directly to company management.</div>
      </li>
      <li class="scope-item">
        <span class="bullet">■</span>
        <div><strong>Dynamic Admin Content Management System (CMS):</strong> Secure administrative portal (/admin) empowering company staff to add, update, or archive project details, images, specifications, completion stages, and locations without writing code.</div>
      </li>
      <li class="scope-item">
        <span class="bullet">■</span>
        <div><strong>Comprehensive SEO & Social Sharing Integration:</strong> Production-grade SEO setup including Schema.org JSON-LD structured data (Corporate Entity & Postal Address schema), automated dynamic XML sitemap (/sitemap.xml), robots.txt crawler directives, and branded OpenGraph preview cards for WhatsApp and social sharing.</div>
      </li>
      <li class="scope-item">
        <span class="bullet">■</span>
        <div><strong>Performance Optimization, SSL Encryption & Multi-Browser QA:</strong> Instantaneous page loading via server-side rendering, asset compression, SSL/TLS HTTPS encryption, and rigorous cross-browser testing on Google Chrome, Apple Safari, Microsoft Edge, and Firefox.</div>
      </li>
    </ul>

    <!-- PAGE BREAK -->
    <div class="page-break" style="margin-top: 30px;"></div>

    <!-- 3. INFRASTRUCTURE & HOSTING OWNERSHIP -->
    <div class="section-title">3. Infrastructure, Hosting & Domain Ownership</div>
    <div class="section-subtitle">Transparent operational division guaranteeing zero recurring server/hosting fees for the client</div>
    
    <table>
      <thead>
        <tr>
          <th style="width: 25%;">Infrastructure Component</th>
          <th style="width: 30%; text-align: center;">Cost Responsibility</th>
          <th>Scope & Operational Details</th>
        </tr>
      </thead>
      <tbody>
        <tr class="green-row">
          <td><strong>Cloud Web Hosting & MongoDB Database</strong></td>
          <td style="text-align: center;"><span class="badge-green">BORNE BY SERVICE PROVIDER<br>(100% COMPLIMENTARY)</span></td>
          <td>All production cloud web hosting, serverless compute runtime, and cloud database (MongoDB) infrastructure charges are fully provided and borne by the Service Provider at zero recurring cost to GPS Projects Private Limited. Includes SSL/TLS certificate setup and automatic renewals.<br><small style="color: var(--green-text); font-weight: 700;">Client Savings: Approx. ₹6,000 - ₹12,000 / year in recurring server bills.</small></td>
        </tr>
        <tr>
          <td><strong>Domain Name Registration & Renewals</strong></td>
          <td style="text-align: center;"><span class="badge-amber">BORNE BY CLIENT<br>(CUSTOMER RESPONSIBILITY)</span></td>
          <td>GPS Projects Private Limited will bear the annual domain registration fees directly through their preferred registrar (e.g., GoDaddy, Namecheap, Hostinger) or reimburse at actual registrar cost (~₹800 - ₹1,200/yr).<br><small style="color: var(--text-light);">Service Provider Scope: Complete DNS records routing (A, CNAME, TXT), domain mapping, and SSL binding performed at zero developer fee.</small></td>
        </tr>
      </tbody>
    </table>

    <!-- 4. FINANCIAL SUMMARY -->
    <div class="section-title">4. Commercial Investment & Financial Summary</div>
    <table>
      <thead>
        <tr>
          <th style="width: 8%; text-align: center;">S.No</th>
          <th style="width: 52%;">Deliverable / Service Component</th>
          <th style="width: 22%; text-align: center;">Cost Responsibility</th>
          <th style="width: 18%; text-align: right;">Amount (INR)</th>
        </tr>
      </thead>
      <tbody>
        <tr>
          <td style="text-align: center; font-weight: 700; color: var(--text-light);">01</td>
          <td><strong>Full-Stack Corporate Website Development</strong><br><small style="color: var(--text-light);">Next.js 16 + React 19, 6 Pages, Inquiries System, SEO & Structured Data</small></td>
          <td style="text-align: center; font-size: 11.5px;">One-Time Development Fee</td>
          <td style="text-align: right; font-weight: 800; color: var(--text-main);">₹8,000/-</td>
        </tr>
        <tr>
          <td style="text-align: center; font-weight: 700; color: var(--text-light);">02</td>
          <td><strong>Dynamic Admin CMS Portal (/admin)</strong><br><small style="color: var(--text-light);">Password-protected dashboard for live project and portfolio updates</small></td>
          <td style="text-align: center; font-size: 11.5px;">Included in Base Fee</td>
          <td style="text-align: right; font-weight: 700; color: var(--green-text);">₹0 (Included)</td>
        </tr>
        <tr class="green-row">
          <td style="text-align: center; font-weight: 700; color: var(--text-light);">03</td>
          <td><strong>Production Cloud Web Hosting</strong><br><small style="color: var(--text-light);">High-performance edge cloud deployment with 99.9% uptime SLA</small></td>
          <td style="text-align: center; font-size: 11.5px; font-weight: 700; color: var(--green-text);">Borne by Service Provider</td>
          <td style="text-align: right; font-weight: 700; color: var(--green-text);">₹0 (Complimentary)</td>
        </tr>
        <tr class="green-row">
          <td style="text-align: center; font-weight: 700; color: var(--text-light);">04</td>
          <td><strong>Cloud Database Infrastructure (MongoDB)</strong><br><small style="color: var(--text-light);">Secure managed cloud database for CMS records & inquiries</small></td>
          <td style="text-align: center; font-size: 11.5px; font-weight: 700; color: var(--green-text);">Borne by Service Provider</td>
          <td style="text-align: right; font-weight: 700; color: var(--green-text);">₹0 (Complimentary)</td>
        </tr>
        <tr class="green-row">
          <td style="text-align: center; font-weight: 700; color: var(--text-light);">05</td>
          <td><strong>SSL Security Certificate (HTTPS Encryption)</strong><br><small style="color: var(--text-light);">Automated configuration, HTTPS redirect & yearly renewals</small></td>
          <td style="text-align: center; font-size: 11.5px; font-weight: 700; color: var(--green-text);">Borne by Service Provider</td>
          <td style="text-align: right; font-weight: 700; color: var(--green-text);">₹0 (Complimentary)</td>
        </tr>
        <tr>
          <td style="text-align: center; font-weight: 700; color: var(--text-light);">06</td>
          <td><strong>Official Domain Name Registration & Annual Renewals</strong><br><small style="color: var(--text-light);">Purchased directly via registrar (e.g. GoDaddy, Namecheap)</small></td>
          <td style="text-align: center; font-size: 11.5px; font-weight: 700; color: var(--amber-text);">Borne by Client (Customer)</td>
          <td style="text-align: right; font-size: 11.5px; color: var(--text-light);">At Actuals<br>(~₹800 - ₹1,200/yr)</td>
        </tr>
      </tbody>
    </table>

    <div class="total-banner">
      <div>
        <div class="label">Total Fixed Investment Payable to Service Provider</div>
        <div class="amount-words">INR ₹8,000/- (Indian Rupees Eight Thousand Only)</div>
      </div>
      <div>
        <div class="amount-num">₹8,000</div>
      </div>
    </div>

    <!-- 5. COMMERCIAL TERMS -->
    <div class="section-title">5. Commercial Terms & Project Conditions</div>
    <ul class="terms-list">
      <li class="terms-item">
        <span class="bullet">•</span>
        <div><strong>Payment Milestones:</strong> The fixed fee of ₹8,000/- is structured across two milestones: 50% Mobilization Advance (₹4,000) upon project acceptance and work commencement; 50% Final Settlement (₹4,000) upon final staging review, client sign-off, and live production domain launch.</div>
      </li>
      <li class="terms-item">
        <span class="bullet">•</span>
        <div><strong>Turnaround Timeline:</strong> Standard project completion is 7 to 10 business days from receipt of initial mobilization advance and necessary corporate media assets.</div>
      </li>
      <li class="terms-item">
        <span class="bullet">•</span>
        <div><strong>Domain Registrar Responsibility:</strong> GPS Projects Private Limited shall purchase the official domain directly or reimburse the registrar invoice at exact actual cost. Recurring annual renewals remain the responsibility of the client. DNS mapping, record routing, and SSL linking are included at zero developer fee.</div>
      </li>
      <li class="terms-item">
        <span class="bullet">•</span>
        <div><strong>Hosting & Database Commitment:</strong> All production web hosting and cloud database infrastructure are borne by the Service Provider with no recurring infrastructure bills charged to the client.</div>
      </li>
      <li class="terms-item">
        <span class="bullet">•</span>
        <div><strong>Warranty & Post-Launch Support:</strong> Includes 30 calendar days of complimentary technical support post-deployment covering bug resolution, display adjustments, and admin panel guidance.</div>
      </li>
      <li class="terms-item">
        <span class="bullet">•</span>
        <div><strong>Client Responsibilities:</strong> Prompt delivery of brand logos, verified project photos, company copy, and registrar credentials for seamless DNS mapping.</div>
      </li>
      <li class="terms-item">
        <span class="bullet">•</span>
        <div><strong>Scope Amendments:</strong> Any advanced functionality requested outside the outlined 6 pages (e.g., payment gateway, custom accounting ERP integrations) will be estimated under a separate change order.</div>
      </li>
    </ul>

    <!-- 6. ACCEPTANCE -->
    <div class="section-title">6. Acceptance & Project Authorization</div>
    <div class="section-subtitle">Sign below to accept this quotation and authorize commencement under the outlined commercial terms</div>

    <div class="sign-table">
      <div class="sign-box">
        <h4>For: GPS Projects Private Limited</h4>
        <div class="role">Authorized Client Signatory</div>
        <div class="sign-field">
          <strong>Signature:</strong> ___________________________________<br>
          <strong>Name:</strong> ___________________________________<br>
          <strong>Designation:</strong> Director / Authorized Signatory<br>
          <strong>Date:</strong> _____ / _____ / 2026
        </div>
      </div>
      <div class="sign-box">
        <h4>For: Service Provider</h4>
        <div class="role">Lead Full-Stack Web Engineer</div>
        <div class="sign-field">
          <strong>Signature:</strong> ___________________________________<br>
          <strong>Name:</strong> Akshit Mahajan<br>
          <strong>Designation:</strong> Lead Web Engineering & Consultant<br>
          <strong>Date:</strong> 08 / 10 / 2026
        </div>
      </div>
    </div>

  </div>

</body>
</html>
"""
    output_html = "Quotation - GPS Projects Private Limited.html"
    with open(output_html, "w", encoding="utf-8") as f:
        f.write(html_content)
    print(f"[OK] Generated HTML Document: {output_html}")

if __name__ == "__main__":
    build_docx_quotation()
    build_html_quotation()
