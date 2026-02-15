from django.http import HttpResponse
from django.utils import timezone
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from reportlab.lib import colors
from reportlab.lib.pagesizes import letter, A4
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.lib.units import inch
from reportlab.platypus import SimpleDocTemplate, Table, TableStyle, Paragraph, Spacer, Image
from reportlab.lib.enums import TA_CENTER, TA_RIGHT, TA_LEFT
from io import BytesIO

from apps.payments.models import Payment
from apps.investors.models import Investor


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def generate_payment_receipt(request, payment_id):
    """
    Generate PDF receipt for a payment.

    GET /api/reports/payment-receipt/{payment_id}/

    Returns a PDF file with payment receipt details.
    """
    try:
        payment = Payment.objects.select_related('investor', 'verified_by').get(id=payment_id)
    except Payment.DoesNotExist:
        return Response({'error': 'Payment not found'}, status=404)

    # Create PDF buffer
    buffer = BytesIO()
    doc = SimpleDocTemplate(buffer, pagesize=letter, rightMargin=72, leftMargin=72,
                            topMargin=72, bottomMargin=18)

    # Container for the 'Flowable' objects
    elements = []

    # Define styles
    styles = getSampleStyleSheet()
    title_style = ParagraphStyle(
        'CustomTitle',
        parent=styles['Heading1'],
        fontSize=24,
        textColor=colors.HexColor('#1B4965'),
        spaceAfter=30,
        alignment=TA_CENTER,
        fontName='Helvetica-Bold'
    )

    heading_style = ParagraphStyle(
        'CustomHeading',
        parent=styles['Heading2'],
        fontSize=14,
        textColor=colors.HexColor('#C9A961'),
        spaceAfter=12,
        fontName='Helvetica-Bold'
    )

    normal_style = styles['Normal']
    normal_style.fontSize = 11
    normal_style.leading = 14

    # Header - Company Name
    title = Paragraph("7-Seas Suites", title_style)
    elements.append(title)

    subtitle = Paragraph("Investor Management Platform", styles['Heading3'])
    elements.append(subtitle)
    elements.append(Spacer(1, 0.3*inch))

    # Receipt Title
    receipt_title = Paragraph("PAYMENT RECEIPT", heading_style)
    elements.append(receipt_title)
    elements.append(Spacer(1, 0.2*inch))

    # Receipt Number and Date
    receipt_info = [
        ['Receipt Number:', f'#{payment.id:06d}'],
        ['Date Issued:', timezone.now().strftime('%B %d, %Y')],
        ['Payment Date:', payment.payment_date.strftime('%B %d, %Y')],
    ]

    receipt_table = Table(receipt_info, colWidths=[2*inch, 4*inch])
    receipt_table.setStyle(TableStyle([
        ('FONTNAME', (0, 0), (0, -1), 'Helvetica-Bold'),
        ('FONTSIZE', (0, 0), (-1, -1), 10),
        ('TEXTCOLOR', (0, 0), (0, -1), colors.HexColor('#1B4965')),
        ('ALIGN', (0, 0), (0, -1), 'RIGHT'),
        ('ALIGN', (1, 0), (1, -1), 'LEFT'),
        ('BOTTOMPADDING', (0, 0), (-1, -1), 6),
    ]))
    elements.append(receipt_table)
    elements.append(Spacer(1, 0.3*inch))

    # Investor Information
    investor_heading = Paragraph("Investor Information", heading_style)
    elements.append(investor_heading)

    investor_info = [
        ['Name:', payment.investor.full_name],
        ['Email:', payment.investor.email],
        ['Phone:', payment.investor.phone or 'N/A'],
        ['Investor Type:', payment.investor.get_investor_type_display()],
    ]

    investor_table = Table(investor_info, colWidths=[2*inch, 4*inch])
    investor_table.setStyle(TableStyle([
        ('FONTNAME', (0, 0), (0, -1), 'Helvetica-Bold'),
        ('FONTSIZE', (0, 0), (-1, -1), 10),
        ('TEXTCOLOR', (0, 0), (0, -1), colors.HexColor('#1B4965')),
        ('ALIGN', (0, 0), (0, -1), 'RIGHT'),
        ('ALIGN', (1, 0), (1, -1), 'LEFT'),
        ('BOTTOMPADDING', (0, 0), (-1, -1), 6),
    ]))
    elements.append(investor_table)
    elements.append(Spacer(1, 0.3*inch))

    # Payment Details
    payment_heading = Paragraph("Payment Details", heading_style)
    elements.append(payment_heading)

    payment_info = [
        ['Payment Type:', payment.get_payment_type_display()],
        ['Payment Method:', payment.get_payment_method_display()],
        ['Reference Number:', payment.reference_number or 'N/A'],
        ['Quarter:', payment.quarter or 'N/A'],
        ['Status:', payment.get_payment_status_display()],
    ]

    if payment.verified_by and payment.verification_date:
        payment_info.append(['Verified By:', payment.verified_by.username])
        payment_info.append(['Verification Date:', payment.verification_date.strftime('%B %d, %Y %I:%M %p')])

    payment_table = Table(payment_info, colWidths=[2*inch, 4*inch])
    payment_table.setStyle(TableStyle([
        ('FONTNAME', (0, 0), (0, -1), 'Helvetica-Bold'),
        ('FONTSIZE', (0, 0), (-1, -1), 10),
        ('TEXTCOLOR', (0, 0), (0, -1), colors.HexColor('#1B4965')),
        ('ALIGN', (0, 0), (0, -1), 'RIGHT'),
        ('ALIGN', (1, 0), (1, -1), 'LEFT'),
        ('BOTTOMPADDING', (0, 0), (-1, -1), 6),
    ]))
    elements.append(payment_table)
    elements.append(Spacer(1, 0.4*inch))

    # Amount - Highlighted
    amount_data = [
        ['AMOUNT PAID:', f'${payment.amount:,.2f}']
    ]

    amount_table = Table(amount_data, colWidths=[4*inch, 2*inch])
    amount_table.setStyle(TableStyle([
        ('FONTNAME', (0, 0), (-1, -1), 'Helvetica-Bold'),
        ('FONTSIZE', (0, 0), (-1, -1), 16),
        ('TEXTCOLOR', (0, 0), (-1, -1), colors.white),
        ('BACKGROUND', (0, 0), (-1, -1), colors.HexColor('#C9A961')),
        ('ALIGN', (0, 0), (0, 0), 'RIGHT'),
        ('ALIGN', (1, 0), (1, 0), 'RIGHT'),
        ('TOPPADDING', (0, 0), (-1, -1), 12),
        ('BOTTOMPADDING', (0, 0), (-1, -1), 12),
        ('LEFTPADDING', (0, 0), (-1, -1), 20),
        ('RIGHTPADDING', (0, 0), (-1, -1), 20),
    ]))
    elements.append(amount_table)
    elements.append(Spacer(1, 0.5*inch))

    # Investment Summary
    summary_heading = Paragraph("Investment Summary", heading_style)
    elements.append(summary_heading)

    summary_info = [
        ['Total Share Amount:', f'${payment.investor.share_amount:,.2f}'],
        ['Total Paid to Date:', f'${payment.investor.total_paid:,.2f}'],
        ['Outstanding Balance:', f'${payment.investor.outstanding_balance:,.2f}'],
        ['Completion:', f'{payment.investor.payment_completion_percentage:.1f}%'],
    ]

    summary_table = Table(summary_info, colWidths=[2*inch, 4*inch])
    summary_table.setStyle(TableStyle([
        ('FONTNAME', (0, 0), (0, -1), 'Helvetica-Bold'),
        ('FONTSIZE', (0, 0), (-1, -1), 10),
        ('TEXTCOLOR', (0, 0), (0, -1), colors.HexColor('#1B4965')),
        ('ALIGN', (0, 0), (0, -1), 'RIGHT'),
        ('ALIGN', (1, 0), (1, -1), 'LEFT'),
        ('BOTTOMPADDING', (0, 0), (-1, -1), 6),
    ]))
    elements.append(summary_table)
    elements.append(Spacer(1, 0.5*inch))

    # Notes
    if payment.notes:
        notes_heading = Paragraph("Notes", heading_style)
        elements.append(notes_heading)
        notes_text = Paragraph(payment.notes, normal_style)
        elements.append(notes_text)
        elements.append(Spacer(1, 0.3*inch))

    # Footer
    elements.append(Spacer(1, 0.5*inch))
    footer_style = ParagraphStyle(
        'Footer',
        parent=styles['Normal'],
        fontSize=9,
        textColor=colors.grey,
        alignment=TA_CENTER
    )
    footer = Paragraph(
        "This is an official receipt from 7-Seas Suites.<br/>"
        "For inquiries, please contact your account manager.",
        footer_style
    )
    elements.append(footer)

    # Build PDF
    doc.build(elements)

    # Get PDF from buffer
    pdf = buffer.getvalue()
    buffer.close()

    # Create response
    response = HttpResponse(content_type='application/pdf')
    response['Content-Disposition'] = f'attachment; filename="receipt_{payment.id:06d}_{payment.investor.last_name}.pdf"'
    response.write(pdf)

    return response


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def generate_investor_statement(request, investor_id):
    """
    Generate PDF statement for an investor showing all payments.

    GET /api/reports/investor-statement/{investor_id}/
    """
    try:
        investor = Investor.objects.get(id=investor_id)
    except Investor.DoesNotExist:
        return Response({'error': 'Investor not found'}, status=404)

    payments = investor.payments.all().order_by('-payment_date')

    # Create PDF buffer
    buffer = BytesIO()
    doc = SimpleDocTemplate(buffer, pagesize=letter, rightMargin=72, leftMargin=72,
                            topMargin=72, bottomMargin=18)

    elements = []
    styles = getSampleStyleSheet()

    # Title
    title_style = ParagraphStyle(
        'CustomTitle',
        parent=styles['Heading1'],
        fontSize=24,
        textColor=colors.HexColor('#1B4965'),
        spaceAfter=30,
        alignment=TA_CENTER,
        fontName='Helvetica-Bold'
    )

    title = Paragraph("7-Seas Suites", title_style)
    elements.append(title)

    subtitle = Paragraph("Investor Statement", styles['Heading2'])
    elements.append(subtitle)
    elements.append(Spacer(1, 0.3*inch))

    # Investor Info
    investor_info = [
        ['Investor:', investor.full_name],
        ['Email:', investor.email],
        ['Type:', investor.get_investor_type_display()],
        ['Joined Date:', investor.joined_date.strftime('%B %d, %Y')],
        ['Statement Date:', timezone.now().strftime('%B %d, %Y')],
    ]

    info_table = Table(investor_info, colWidths=[2*inch, 4*inch])
    info_table.setStyle(TableStyle([
        ('FONTNAME', (0, 0), (0, -1), 'Helvetica-Bold'),
        ('FONTSIZE', (0, 0), (-1, -1), 10),
        ('ALIGN', (0, 0), (0, -1), 'RIGHT'),
        ('BOTTOMPADDING', (0, 0), (-1, -1), 6),
    ]))
    elements.append(info_table)
    elements.append(Spacer(1, 0.3*inch))

    # Summary
    summary_data = [
        ['Share Amount:', f'${investor.share_amount:,.2f}'],
        ['Total Paid:', f'${investor.total_paid:,.2f}'],
        ['Outstanding:', f'${investor.outstanding_balance:,.2f}'],
        ['Completion:', f'{investor.payment_completion_percentage:.1f}%'],
    ]

    summary_table = Table(summary_data, colWidths=[2*inch, 4*inch])
    summary_table.setStyle(TableStyle([
        ('FONTNAME', (0, 0), (0, -1), 'Helvetica-Bold'),
        ('FONTSIZE', (0, 0), (-1, -1), 11),
        ('BACKGROUND', (0, 0), (-1, -1), colors.HexColor('#F5F5F5')),
        ('ALIGN', (0, 0), (0, -1), 'RIGHT'),
        ('TOPPADDING', (0, 0), (-1, -1), 8),
        ('BOTTOMPADDING', (0, 0), (-1, -1), 8),
    ]))
    elements.append(summary_table)
    elements.append(Spacer(1, 0.4*inch))

    # Payment History
    if payments.exists():
        heading = Paragraph("Payment History", styles['Heading3'])
        elements.append(heading)
        elements.append(Spacer(1, 0.1*inch))

        payment_data = [['Date', 'Type', 'Amount', 'Status', 'Reference']]

        for payment in payments:
            payment_data.append([
                payment.payment_date.strftime('%Y-%m-%d'),
                payment.get_payment_type_display(),
                f'${payment.amount:,.2f}',
                payment.get_payment_status_display(),
                payment.reference_number or '-'
            ])

        payment_table = Table(payment_data, colWidths=[1.2*inch, 1.5*inch, 1.2*inch, 1.2*inch, 1.5*inch])
        payment_table.setStyle(TableStyle([
            ('FONTNAME', (0, 0), (-1, 0), 'Helvetica-Bold'),
            ('FONTSIZE', (0, 0), (-1, -1), 9),
            ('BACKGROUND', (0, 0), (-1, 0), colors.HexColor('#1B4965')),
            ('TEXTCOLOR', (0, 0), (-1, 0), colors.white),
            ('ALIGN', (0, 0), (-1, -1), 'CENTER'),
            ('GRID', (0, 0), (-1, -1), 0.5, colors.grey),
            ('ROWBACKGROUNDS', (0, 1), (-1, -1), [colors.white, colors.HexColor('#F9F9F9')]),
            ('TOPPADDING', (0, 0), (-1, -1), 6),
            ('BOTTOMPADDING', (0, 0), (-1, -1), 6),
        ]))
        elements.append(payment_table)

    # Build PDF
    doc.build(elements)

    pdf = buffer.getvalue()
    buffer.close()

    response = HttpResponse(content_type='application/pdf')
    response['Content-Disposition'] = f'attachment; filename="statement_{investor.last_name}_{investor.id}.pdf"'
    response.write(pdf)

    return response
