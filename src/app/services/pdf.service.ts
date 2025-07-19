import { Injectable } from '@angular/core';
import jsPDF from 'jspdf';

@Injectable({
  providedIn: 'root'
})
export class PdfService {

  generateRentalAgreement(bookingData: any): void {
    const doc = new jsPDF();
    
    // Header
    doc.setFontSize(20);
    doc.setTextColor(53, 99, 233);
    doc.text('EasyVehicleRental', 20, 20);
    doc.text('RENTAL AGREEMENT', 20, 35);
    
    // Agreement details
    doc.setFontSize(12);
    doc.setTextColor(0, 0, 0);
    doc.text(`Agreement Date: ${new Date().toLocaleDateString()}`, 20, 55);
    doc.text(`Booking ID: #${bookingData.id}`, 20, 65);
    doc.text(`Vehicle: ${bookingData.vehicleName}`, 20, 75);
    doc.text(`Rental Period: ${bookingData.startDate} to ${bookingData.endDate}`, 20, 85);
    doc.text(`Total Amount: LKR ${bookingData.totalAmount}`, 20, 95);
    
    // Terms and conditions
    doc.text('Terms and Conditions:', 20, 115);
    const terms = [
      '1. The renter agrees to return the vehicle in the same condition.',
      '2. Any damage to the vehicle will be charged to the renter.',
      '3. The vehicle must be returned on time to avoid additional charges.',
      '4. The renter must have a valid driving license.',
      '5. Insurance coverage is included in the rental fee.'
    ];
    
    terms.forEach((term, index) => {
      doc.text(term, 20, 125 + (index * 10));
    });
    
    // Signature section
    doc.text('Renter Signature: _____________________', 20, 200);
    doc.text('Date: _____________________', 20, 210);
    
    // Save the PDF
    doc.save(`rental-agreement-${bookingData.id}.pdf`);
  }

  generateEarningsReport(reportData: any): void {
    const doc = new jsPDF();
    
    // Header
    doc.setFontSize(18);
    doc.setTextColor(53, 99, 233);
    doc.text('EasyVehicleRental', 20, 20);
    doc.text(`Earnings Report - ${reportData.vehicleName}`, 20, 35);
    
    // Summary
    doc.setFontSize(12);
    doc.setTextColor(0, 0, 0);
    doc.text(`Report Generated: ${new Date().toLocaleDateString()}`, 20, 55);
    doc.text(`Vehicle ID: ${reportData.vehicleId}`, 20, 65);
    doc.text(`Total Earnings: LKR ${reportData.totalEarnings}`, 20, 75);
    doc.text(`Completed Bookings: ${reportData.bookingsCount}`, 20, 85);
    doc.text(`Average Booking Value: LKR ${reportData.averageBooking}`, 20, 95);
    
    // Table header
    doc.setFont('helvetica', 'bold');
    let yPosition = 115;
    doc.text('Booking ID', 20, yPosition);
    doc.text('Renter', 50, yPosition);
    doc.text('Dates', 80, yPosition);
    doc.text('Base Amount', 120, yPosition);
    doc.text('Your Earnings', 160, yPosition);
    
    // Header line
    doc.line(20, yPosition + 2, 190, yPosition + 2);
    yPosition += 10;
    
    // Table data
    doc.setFont('helvetica', 'normal');
    reportData.bookings.forEach((booking: any) => {
      if (yPosition > 270) {
        doc.addPage();
        yPosition = 20;
      }
      
      doc.text(`#${booking.id}`, 20, yPosition);
      doc.text(booking.renterName.substring(0, 12), 50, yPosition);
      doc.text(`${new Date(booking.startDate).toLocaleDateString()} - ${new Date(booking.endDate).toLocaleDateString()}`, 80, yPosition);
      doc.text(`LKR ${booking.baseAmount}`, 120, yPosition);
      doc.text(`LKR ${booking.ownerEarnings}`, 160, yPosition);
      
      yPosition += 8;
    });
    
    // Footer
    const totalPages = doc.getNumberOfPages();
    for (let i = 1; i <= totalPages; i++) {
      doc.setPage(i);
      doc.setFontSize(8);
      doc.text(`Generated on ${new Date().toLocaleString()}`, 20, 285);
      doc.text(`Page ${i} of ${totalPages}`, 170, 285);
    }
    
    // Save the PDF
    doc.save(`earnings-report-${reportData.vehicleName.replace(/\s+/g, '-')}-${new Date().getMonth() + 1}-${new Date().getFullYear()}.pdf`);
  }

  generateMonthlyReport(reportType: string, data: any[]): void {
    const doc = new jsPDF();
    
    // Header
    doc.setFontSize(18);
    doc.setTextColor(53, 99, 233);
    doc.text('EasyVehicleRental', 20, 20);
    doc.text(`${reportType} Report - ${new Date().toLocaleDateString()}`, 20, 35);
    
    // Table setup
    doc.setFontSize(10);
    doc.setTextColor(0, 0, 0);
    
    let yPosition = 55;
    const lineHeight = 8;
    const pageHeight = 280;
    
    if (reportType === 'Vehicles') {
      // Table header
      doc.setFont('helvetica', 'bold');
      doc.text('ID', 20, yPosition);
      doc.text('Name', 35, yPosition);
      doc.text('Type', 80, yPosition);
      doc.text('Price/Day', 105, yPosition);
      doc.text('Owner', 135, yPosition);
      doc.text('Status', 170, yPosition);
      
      // Header line
      doc.line(20, yPosition + 2, 190, yPosition + 2);
      yPosition += 10;
      
      // Table data
      doc.setFont('helvetica', 'normal');
      data.forEach((item, index) => {
        if (yPosition > pageHeight) {
          doc.addPage();
          yPosition = 20;
        }
        
        doc.text(String(item.id || index + 1), 20, yPosition);
        doc.text(item.name?.substring(0, 20) || 'N/A', 35, yPosition);
        doc.text(item.type || 'N/A', 80, yPosition);
        doc.text(`LKR ${item.pricePerDay || 0}`, 105, yPosition);
        doc.text(item.ownerName?.substring(0, 15) || 'N/A', 135, yPosition);
        doc.text(item.available ? 'Available' : 'Unavailable', 170, yPosition);
        
        yPosition += lineHeight;
      });
      
    } else if (reportType === 'Bookings') {
      // Table header
      doc.setFont('helvetica', 'bold');
      doc.text('ID', 20, yPosition);
      doc.text('Vehicle', 35, yPosition);
      doc.text('User', 70, yPosition);
      doc.text('Start Date', 100, yPosition);
      doc.text('End Date', 130, yPosition);
      doc.text('Amount', 160, yPosition);
      doc.text('Status', 180, yPosition);
      
      // Header line
      doc.line(20, yPosition + 2, 200, yPosition + 2);
      yPosition += 10;
      
      // Table data
      doc.setFont('helvetica', 'normal');
      data.forEach((item, index) => {
        if (yPosition > pageHeight) {
          doc.addPage();
          yPosition = 20;
        }
        
        doc.text(String(item.id || index + 1), 20, yPosition);
        doc.text(item.vehicleName?.substring(0, 15) || 'N/A', 35, yPosition);
        doc.text(item.userName?.substring(0, 12) || 'N/A', 70, yPosition);
        doc.text(new Date(item.startDate).toLocaleDateString() || 'N/A', 100, yPosition);
        doc.text(new Date(item.endDate).toLocaleDateString() || 'N/A', 130, yPosition);
        doc.text(`LKR ${item.totalAmount || 0}`, 160, yPosition);
        doc.text(item.status || 'N/A', 180, yPosition);
        
        yPosition += lineHeight;
      });
      
    } else if (reportType === 'Users') {
      // Table header
      doc.setFont('helvetica', 'bold');
      doc.text('ID', 20, yPosition);
      doc.text('Name', 35, yPosition);
      doc.text('Email', 70, yPosition);
      doc.text('Phone', 110, yPosition);
      doc.text('Join Date', 145, yPosition);
      doc.text('Role', 175, yPosition);
      
      // Header line
      doc.line(20, yPosition + 2, 190, yPosition + 2);
      yPosition += 10;
      
      // Table data
      doc.setFont('helvetica', 'normal');
      data.forEach((item, index) => {
        if (yPosition > pageHeight) {
          doc.addPage();
          yPosition = 20;
        }
        
        doc.text(String(item.id || index + 1), 20, yPosition);
        doc.text(item.name?.substring(0, 15) || 'N/A', 35, yPosition);
        doc.text(item.email?.substring(0, 20) || 'N/A', 70, yPosition);
        doc.text(item.phone?.substring(0, 15) || 'N/A', 110, yPosition);
        doc.text(new Date(item.joinDate).toLocaleDateString() || 'N/A', 145, yPosition);
        doc.text(item.role || 'USER', 175, yPosition);
        
        yPosition += lineHeight;
      });
    }
    
    // Footer
    const totalPages = doc.getNumberOfPages();
    for (let i = 1; i <= totalPages; i++) {
      doc.setPage(i);
      doc.setFontSize(8);
      doc.text(`Generated on ${new Date().toLocaleString()}`, 20, 285);
      doc.text(`Page ${i} of ${totalPages}`, 170, 285);
    }
    
    // Save the PDF
    doc.save(`${reportType.toLowerCase()}-report-${new Date().getMonth() + 1}-${new Date().getFullYear()}.pdf`);
  }
}