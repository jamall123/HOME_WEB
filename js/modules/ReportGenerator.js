/**
 * ReportGenerator.js
 * Generates downloadable reports (CSV) natively in the browser.
 */

export class ReportGeneratorClass {
    downloadCSV(filename, headers, rows) {
        let csvContent = 'data:text/csv;charset=utf-8,';
        
        // Add headers
        csvContent += headers.join(',') + '\r\n';
        
        // Add rows
        rows.forEach(row => {
            const rowStr = row.map(cell => `"${String(cell).replace(/"/g, '""')}"`).join(',');
            csvContent += rowStr + '\r\n';
        });

        // Trigger download
        const encodedUri = encodeURI(csvContent);
        const link = document.createElement('a');
        link.setAttribute('href', encodedUri);
        link.setAttribute('download', filename);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    }

    generateStudentReport(studentStats) {
        const headers = ['Lesson', 'Completion (%)', 'Attendance (Mins)', 'Downloads', 'Quiz Score'];
        this.downloadCSV('student_progress_report.csv', headers, studentStats);
    }

    generateCourseReport(courseStats) {
        const headers = ['Student ID', 'Engagement Score', 'Drop-Off Risk', 'Total Time'];
        this.downloadCSV('course_analytics_report.csv', headers, courseStats);
    }
}
export const ReportGenerator = new ReportGeneratorClass();
