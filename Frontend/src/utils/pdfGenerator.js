// src/utils/pdfGenerator.js
/**
 * PDF Generation utility for survey responses
 * Uses browser's print functionality as a fallback when jsPDF is not available
 */

export const generateResponsePDF = (response) => {
  try {
    // Create a new window for PDF content
    const printWindow = window.open('', '_blank');

    if (!printWindow) {
      throw new Error('Popup blocked. Please enable popups for this site.');
    }

    // Format the response data for PDF
    const formatAnswers = (answers) => {
      if (!answers || answers.length === 0) {
        return '<p style="color: #666; font-style: italic;">No answers recorded</p>';
      }

      return answers.map(answer => {
        const question = answer.Question.label || answer.Question.question_text;
        let answerText = 'No answer';

        if (answer.QuestionOption) {
          answerText = answer.QuestionOption.option_text;
        } else if (answer.numeric_answer !== null) {
          answerText = answer.numeric_answer.toString();
        } else if (answer.text_answer) {
          answerText = answer.text_answer;
        }

        return `
          <div style="margin-bottom: 20px; padding: 15px; border-left: 4px solid #007bff; background-color: #f8f9fa;">
            <div style="font-weight: bold; color: #2c3e50; margin-bottom: 8px;">
              ${escapeHtml(question)}
            </div>
            <div style="color: #495057; line-height: 1.4;">
              ${escapeHtml(answerText)}
            </div>
          </div>
        `;
      }).join('');
    };

    // Escape HTML to prevent XSS
    const escapeHtml = (text) => {
      const div = document.createElement('div');
      div.textContent = text;
      return div.innerHTML;
    };

    // Format date
    const formatDate = (dateString) => {
      return new Date(dateString).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    };

    // Generate HTML content for PDF
    const htmlContent = `
      <!DOCTYPE html>
      <html>
      <head>
        <title>Survey Response - ${escapeHtml(response.Survey.title)}</title>
        <meta charset="utf-8">
        <style>
          body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Arial, sans-serif;
            line-height: 1.6;
            color: #333;
            max-width: 800px;
            margin: 0 auto;
            padding: 20px;
            background: white;
          }
          .header {
            border-bottom: 2px solid #007bff;
            padding-bottom: 20px;
            margin-bottom: 30px;
            text-align: center;
          }
          .header h1 {
            color: #2c3e50;
            margin: 0 0 10px 0;
            font-size: 28px;
          }
          .header .survey-title {
            color: #007bff;
            font-size: 18px;
            font-weight: 600;
            margin: 10px 0;
          }
          .header .meta {
            color: #666;
            font-size: 14px;
          }
          .section {
            margin-bottom: 30px;
          }
          .section h2 {
            color: #2c3e50;
            border-bottom: 1px solid #e9ecef;
            padding-bottom: 10px;
            margin-bottom: 20px;
            font-size: 20px;
          }
          .info-grid {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
            gap: 15px;
            margin-bottom: 20px;
          }
          .info-item {
            padding: 15px;
            background-color: #f8f9fa;
            border-radius: 8px;
            border: 1px solid #e9ecef;
          }
          .info-label {
            font-weight: bold;
            color: #495057;
            margin-bottom: 5px;
          }
          .info-value {
            color: #6c757d;
          }
          .answers-container {
            margin-top: 20px;
          }
          .footer {
            margin-top: 40px;
            padding-top: 20px;
            border-top: 1px solid #e9ecef;
            text-align: center;
            color: #6c757d;
            font-size: 12px;
          }
          @media print {
            body { margin: 0; padding: 15px; }
            .header h1 { font-size: 24px; }
            .section h2 { font-size: 18px; }
          }
        </style>
      </head>
      <body>
        <div class="header">
          <h1>Survey Response Report</h1>
          <div class="survey-title">${escapeHtml(response.Survey.title)}</div>
          <div class="meta">
            Generated on ${formatDate(new Date())}
          </div>
        </div>

        <div class="section">
          <h2>Survey Information</h2>
          <div class="info-grid">
            <div class="info-item">
              <div class="info-label">Survey Title</div>
              <div class="info-value">${escapeHtml(response.Survey.title)}</div>
            </div>
            <div class="info-item">
              <div class="info-label">Response Date</div>
              <div class="info-value">${formatDate(response.created_at)}</div>
            </div>
            <div class="info-item">
              <div class="info-label">Status</div>
              <div class="info-value">${escapeHtml(response.status || 'Completed')}</div>
            </div>
            ${response.Survey.description ? `
            <div class="info-item">
              <div class="info-label">Description</div>
              <div class="info-value">${escapeHtml(response.Survey.description)}</div>
            </div>
            ` : ''}
          </div>
        </div>

        <div class="section">
          <h2>Your Answers</h2>
          <div class="answers-container">
            ${formatAnswers(response.Answers)}
          </div>
        </div>

        <div class="footer">
          <p>This report was generated from your survey response data.</p>
          <p>© ${new Date().getFullYear()} Survey Platform. All rights reserved.</p>
        </div>
      </body>
      </html>
    `;

    // Write content to new window
    printWindow.document.write(htmlContent);
    printWindow.document.close();

    // Wait for content to load, then trigger print
    printWindow.onload = () => {
      setTimeout(() => {
        printWindow.print();

        // Close the window after printing (with some delay for print dialog)
        setTimeout(() => {
          printWindow.close();
        }, 1000);
      }, 500);
    };

    return true;
  } catch (error) {
    console.error('Error generating PDF:', error);
    throw error;
  }
};

/**
 * Alternative PDF generation using jsPDF (when available)
 */
export const generateAdvancedResponsePDF = async (response) => {
  try {
    // Dynamic import to handle cases where jsPDF is not available
    const { default: jsPDF } = await import('jspdf');
    await import('jspdf-autotable');

    const doc = new jsPDF();
    const pageWidth = doc.internal.pageSize.width;

    // Header
    doc.setFontSize(20);
    doc.setTextColor(44, 62, 80);
    doc.text('Survey Response Report', pageWidth / 2, 30, { align: 'center' });

    doc.setFontSize(14);
    doc.setTextColor(0, 123, 255);
    doc.text(response.Survey.title, pageWidth / 2, 45, { align: 'center' });

    doc.setFontSize(10);
    doc.setTextColor(102, 102, 102);
    doc.text(`Generated on ${new Date().toLocaleDateString()}`, pageWidth / 2, 55, { align: 'center' });

    // Survey Information Table
    const surveyInfo = [
      ['Survey Title', response.Survey.title],
      ['Response Date', new Date(response.created_at).toLocaleDateString()],
      ['Status', response.status || 'Completed'],
    ];

    if (response.Survey.description) {
      surveyInfo.push(['Description', response.Survey.description]);
    }

    doc.autoTable({
      startY: 70,
      head: [['Field', 'Value']],
      body: surveyInfo,
      headStyles: { fillColor: [0, 123, 255] },
      margin: { left: 20, right: 20 },
    });

    // Answers Section
    if (response.Answers && response.Answers.length > 0) {
      const finalY = doc.lastAutoTable.finalY + 20;

      doc.setFontSize(16);
      doc.setTextColor(44, 62, 80);
      doc.text('Your Answers', 20, finalY);

      const answersData = response.Answers.map((answer, index) => {
        const question = answer.Question.label || answer.Question.question_text;
        let answerText = 'No answer';

        if (answer.QuestionOption) {
          answerText = answer.QuestionOption.option_text;
        } else if (answer.numeric_answer !== null) {
          answerText = answer.numeric_answer.toString();
        } else if (answer.text_answer) {
          answerText = answer.text_answer;
        }

        return [index + 1, question, answerText];
      });

      doc.autoTable({
        startY: finalY + 10,
        head: [['#', 'Question', 'Answer']],
        body: answersData,
        headStyles: { fillColor: [40, 167, 69] },
        columnStyles: {
          0: { cellWidth: 10 },
          1: { cellWidth: 80 },
          2: { cellWidth: 80 },
        },
        margin: { left: 20, right: 20 },
        styles: {
          cellPadding: 5,
          fontSize: 9,
          overflow: 'linebreak',
        },
      });
    }

    // Save the PDF
    const fileName = `survey-response-${response.Survey.title.replace(/[^a-zA-Z0-9]/g, '-')}-${new Date().toISOString().split('T')[0]}.pdf`;
    doc.save(fileName);

    return true;
  } catch (error) {
    console.error('Advanced PDF generation failed:', error);
    // Fall back to simple PDF generation
    return generateResponsePDF(response);
  }
};

const pdfGenerator = {
  generateResponsePDF,
  generateAdvancedResponsePDF,
};

export default pdfGenerator;