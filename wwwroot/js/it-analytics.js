window.analyticsModule = (function () {
    let currentTab = 'overview';
    let charts = {};
    
    const colors = {
        primary: '#3b82f6',
        success: '#10b981',
        warning: '#f59e0b',
        danger: '#ef4444',
        purple: '#8b5cf6',
        teal: '#14b8a6',
        textMuted: '#64748b'
    };

    async function fetchApi(url) {
        try {
            const res = await fetch(url);
            if (!res.ok) throw new Error('Network response was not ok');
            return await res.json();
        } catch (error) {
            console.error('Fetch error:', error);
            showToast('Lỗi tải dữ liệu phân tích!', 'error');
            return null;
        }
    }

    function destroyChart(chartId) {
        if (charts[chartId]) {
            charts[chartId].destroy();
            delete charts[chartId];
        }
    }

    function getFilters() {
        const startDate = document.getElementById('anaStartDate').value;
        const endDate = document.getElementById('anaEndDate').value;
        const deptId = document.getElementById('anaDeptSelect').value;
        let query = '?';
        if (startDate) query += `startDate=${startDate}&`;
        if (endDate) query += `endDate=${endDate}&`;
        if (deptId) query += `deptId=${deptId}`;
        return query;
    }

    async function loadFilterData() {
        const data = await fetchApi('/api/it/advanced-analytics/departments');
        if (data && data.success) {
            const select = document.getElementById('anaDeptSelect');
            select.innerHTML = '<option value="">Tất cả phòng ban</option>';
            data.data.forEach(d => {
                select.innerHTML += `<option value="${d.id}">${d.name}</option>`;
            });
        }
    }

    function renderGrowth(elementId, current, prev, isPercent = false) {
        const el = document.getElementById(elementId);
        if(!el) return;
        const diff = current - prev;
        let diffFormatted = isPercent ? diff.toFixed(1) + '%' : diff.toLocaleString();
        if (diff > 0) {
            el.innerText = '+' + diffFormatted;
            el.className = 'ana-stat-growth positive';
        } else if (diff < 0) {
            el.innerText = diffFormatted;
            el.className = 'ana-stat-growth negative';
        } else {
            el.innerText = '0' + (isPercent ? '%' : '');
            el.className = 'ana-stat-growth';
            el.style.color = '#94a3b8';
        }
    }

    async function loadOverview() {
        const data = await fetchApi('/api/it/advanced-analytics/overview' + getFilters());
        if (!data || !data.success) return;

        // Stat cards
        document.getElementById('ana-stat-users').innerText = data.totalUsers.toLocaleString();
        renderGrowth('ana-growth-users', data.totalUsers, data.prevUsers);
        document.getElementById('ana-prev-users').innerText = data.prevUsers.toLocaleString();

        document.getElementById('ana-stat-courses').innerText = data.totalCourses.toLocaleString();
        renderGrowth('ana-growth-courses', data.totalCourses, data.prevCourses);
        document.getElementById('ana-prev-courses').innerText = data.prevCourses.toLocaleString();

        document.getElementById('ana-stat-enrolls').innerText = data.totalEnrollments.toLocaleString();
        renderGrowth('ana-growth-enrolls', data.totalEnrollments, data.prevEnrollmentsCount);
        document.getElementById('ana-prev-enrolls').innerText = data.prevEnrollmentsCount.toLocaleString();

        document.getElementById('ana-stat-rate').innerText = data.completionRate + '%';
        renderGrowth('ana-growth-rate', data.completionRate, data.prevCompletionRate, true);
        document.getElementById('ana-prev-rate').innerText = data.prevCompletionRate + '%';

        document.getElementById('ana-stat-certs').innerText = data.totalCerts.toLocaleString();
        renderGrowth('ana-growth-certs', data.totalCerts, data.prevCerts);
        document.getElementById('ana-prev-certs').innerText = data.prevCerts.toLocaleString();

        document.getElementById('ana-stat-score').innerText = data.avgScore;
        renderGrowth('ana-growth-score', data.avgScore, data.prevAvgScore);
        document.getElementById('ana-prev-score').innerText = data.prevAvgScore;

        // Trend Chart (Dual Axis)
        destroyChart('anaTrendChart');
        if (data.trend) {
            const ctx = document.getElementById('anaTrendChart').getContext('2d');
            charts['anaTrendChart'] = new Chart(ctx, {
                type: 'line',
                data: {
                    labels: data.trend.map(t => t.label),
                    datasets: [
                        { label: 'Tỷ lệ hoàn thành (%)', data: data.trend.map(t => t.completionRate), borderColor: colors.primary, backgroundColor: colors.primary, yAxisID: 'y', tension: 0.4 },
                        { label: 'Điểm trung bình', data: data.trend.map(t => t.avgScore), borderColor: colors.success, backgroundColor: colors.success, yAxisID: 'y1', tension: 0.4 }
                    ]
                },
                options: {
                    responsive: true, maintainAspectRatio: false,
                    plugins: { legend: { position: 'top', labels: { boxWidth: 12, usePointStyle: true } } },
                    scales: {
                        y: { type: 'linear', display: true, position: 'left', min: 0, max: 100, title: { display: true, text: 'Tỷ lệ (%)', font: {size: 10} } },
                        y1: { type: 'linear', display: true, position: 'right', min: 0, max: 100, grid: { drawOnChartArea: false }, title: { display: true, text: 'Điểm', font: {size: 10} } },
                        x: { grid: { display: false } }
                    }
                }
            });
        }

        // Dept Horizontal Bar
        destroyChart('anaDeptBarChart');
        if (data.deptCompletion) {
            const barColors = [colors.primary, colors.success, colors.warning, colors.purple, colors.danger, colors.teal];
            const ctx = document.getElementById('anaDeptBarChart').getContext('2d');
            charts['anaDeptBarChart'] = new Chart(ctx, {
                type: 'bar',
                data: {
                    labels: data.deptCompletion.map(d => d.name),
                    datasets: [{
                        data: data.deptCompletion.map(d => d.rate),
                        backgroundColor: data.deptCompletion.map((_, i) => barColors[i % barColors.length]),
                        barThickness: 12, borderRadius: 4
                    }]
                },
                options: {
                    indexAxis: 'y', responsive: true, maintainAspectRatio: false,
                    plugins: { legend: { display: false } },
                    scales: {
                        x: { min: 0, max: 100, ticks: { callback: function(val){ return val + "%" } } },
                        y: { grid: { display: false } }
                    }
                }
            });
        }

        // Category Doughnut
        destroyChart('anaCategoryChart');
        if (data.categoryDistribution) {
            const catColors = [colors.primary, colors.success, colors.warning, colors.danger, colors.purple, colors.teal];
            const totalCats = data.categoryDistribution.reduce((sum, c) => sum + c.count, 0);
            const elTotal = document.getElementById('ana-cat-total');
            if (elTotal) elTotal.innerText = totalCats;
            
            const ctx = document.getElementById('anaCategoryChart').getContext('2d');
            charts['anaCategoryChart'] = new Chart(ctx, {
                type: 'doughnut',
                data: {
                    labels: data.categoryDistribution.map(c => c.name),
                    datasets: [{ data: data.categoryDistribution.map(c => c.count), backgroundColor: catColors, cutout: '75%', borderWidth: 0 }]
                },
                options: { responsive: true, maintainAspectRatio: false, plugins: { legend: { display: false } } }
            });

            const legendHtml = data.categoryDistribution.map((c, i) => {
                let perc = totalCats > 0 ? ((c.count / totalCats) * 100).toFixed(1) : 0;
                let color = catColors[i % catColors.length];
                return `<div style="display:flex; justify-content:space-between; align-items:center;">
                    <span><span style="display:inline-block; width:10px; height:10px; border-radius:50%; background:${color}; margin-right:8px;"></span>${c.name.length > 20 ? c.name.substring(0,18)+'...' : c.name}</span>
                    <span style="color:#64748b">${c.count} (${perc}%)</span>
                </div>`;
            }).join('');
            document.getElementById('anaCategoryLegend').innerHTML = legendHtml;
        }

        // Top 5 Courses Table
        const topBody = document.getElementById('anaTopCoursesBody');
        if (topBody) {
            topBody.innerHTML = '';
            data.topCourses.forEach((c, i) => {
                topBody.innerHTML += `<tr>
                    <td>${i+1}</td>
                    <td><strong>${c.title}</strong></td>
                    <td>${c.enrollments}</td>
                    <td>${c.rate}%</td>
                    <td>${c.score}</td>
                </tr>`;
            });
        }

        // Low Courses Table
        const lowBody = document.getElementById('anaLowCoursesBody');
        if (lowBody) {
            lowBody.innerHTML = '';
            data.lowCourses.forEach((c, i) => {
                lowBody.innerHTML += `<tr>
                    <td>${i+1}</td>
                    <td><strong>${c.title}</strong></td>
                    <td>${c.dept}</td>
                    <td>${c.enrollments}</td>
                    <td>${c.rate}%</td>
                    <td>${c.score}</td>
                    <td><button class="btn btn-sm btn-outline">Xem chi tiết</button></td>
                </tr>`;
            });
        }

        // Heatmap
        renderHeatmap(data.heatmap);
    }

    function renderHeatmap(heatmapData) {
        const grid = document.getElementById('anaHeatmapGrid');
        if (!grid || !heatmapData) return;
        grid.innerHTML = '';
        const maxVal = Math.max(...heatmapData.map(h => h.value), 1);
        
        for (let d = 0; d < 7; d++) {
            for (let h = 0; h < 24; h++) {
                const cellData = heatmapData.find(x => x.day === d && x.hour === h) || {value: 0};
                const val = cellData.value;
                const opacity = val / maxVal;
                
                const cell = document.createElement('div');
                cell.className = 'ana-heatmap-cell';
                if (val > 0) {
                    const l = 95 - (opacity * 50);
                    cell.style.backgroundColor = `hsl(230, 80%, ${l}%)`;
                    cell.title = `Thứ ${d===6 ? 'CN' : d+2}, ${h}h: ${val} lượt hoạt động`;
                }
                grid.appendChild(cell);
            }
        }
    }

    async function loadDepartments() {
        const data = await fetchApi('/api/it/advanced-analytics/departments' + getFilters());
        if (!data || !data.success) return;

        const tbody = document.getElementById('anaDeptTableBody');
        tbody.innerHTML = '';
        data.data.forEach(d => {
            tbody.innerHTML += `<tr>
                <td><strong>${d.name}</strong></td>
                <td>${d.userCount}</td>
                <td>${d.totalEnrollments}</td>
                <td>
                    <div class="progress" style="height:8px; margin-top:4px;">
                        <div class="progress-bar ${d.completionRate < 50 ? 'bg-danger' : 'bg-success'}" style="width: ${d.completionRate}%"></div>
                    </div>
                    <small>${d.completionRate}%</small>
                </td>
                <td><button class="btn btn-sm btn-outline" onclick="analyticsModule.viewDeptUsers(${d.id})">Xem NV</button></td>
            </tr>`;
        });

        destroyChart('anaDeptBarChart');
        destroyChart('anaDeptPieChart');

        const ctxBar = document.getElementById('anaDeptBarChart').getContext('2d');
        charts['anaDeptBarChart'] = new Chart(ctxBar, {
            type: 'bar',
            data: {
                labels: data.data.map(d => d.name),
                datasets: [{ label: 'Tỷ lệ hoàn thành (%)', data: data.data.map(d => d.completionRate), backgroundColor: colors.primary }]
            },
            options: { responsive: true, maintainAspectRatio: false, scales: { y: { beginAtZero: true, max: 100 } } }
        });

        const ctxPie = document.getElementById('anaDeptPieChart').getContext('2d');
        charts['anaDeptPieChart'] = new Chart(ctxPie, {
            type: 'doughnut',
            data: {
                labels: data.data.map(d => d.name),
                datasets: [{ data: data.data.map(d => d.totalEnrollments), backgroundColor: [colors.primary, colors.success, colors.warning, colors.danger, colors.purple, '#ec4899', '#14b8a6'] }]
            },
            options: { responsive: true, maintainAspectRatio: false, plugins: { legend: { position: 'right' } } }
        });
    }

    async function loadCourses() {
        const data = await fetchApi('/api/it/advanced-analytics/courses' + getFilters());
        if (!data || !data.success) return;

        const tbody = document.getElementById('anaCourseTableBody');
        tbody.innerHTML = '';
        data.data.forEach(c => {
            tbody.innerHTML += `<tr>
                <td>${c.title}</td>
                <td>${c.category}</td>
                <td>${c.totalEnrollments}</td>
                <td>${c.completionRate}%</td>
                <td>⭐ ${c.avgRating}</td>
            </tr>`;
        });

        destroyChart('anaCourseChart');
        const top10 = data.data.slice(0, 10);
        const ctx = document.getElementById('anaCourseChart').getContext('2d');
        charts['anaCourseChart'] = new Chart(ctx, {
            type: 'bar',
            data: {
                labels: top10.map(c => c.title.substring(0, 20) + '...'),
                datasets: [{ label: 'Lượt ghi danh', data: top10.map(c => c.totalEnrollments), backgroundColor: colors.purple }]
            },
            options: { responsive: true, maintainAspectRatio: false, indexAxis: 'y' }
        });
    }

    async function loadExams() {
        const data = await fetchApi('/api/it/advanced-analytics/exams' + getFilters());
        if (!data || !data.success) return;

        const tbody = document.getElementById('anaExamTableBody');
        tbody.innerHTML = '';
        data.data.forEach(e => {
            tbody.innerHTML += `<tr>
                <td>${e.title}</td>
                <td>${e.totalAttempts}</td>
                <td><span style="color:${e.passRate >= 80 ? colors.success : colors.danger}; font-weight:600">${e.passRate}%</span></td>
                <td>${e.avgScore}đ</td>
            </tr>`;
        });

        destroyChart('anaExamChart');
        const top10 = data.data.slice(0, 10);
        const ctx = document.getElementById('anaExamChart').getContext('2d');
        charts['anaExamChart'] = new Chart(ctx, {
            type: 'bar',
            data: {
                labels: top10.map(e => e.title.substring(0, 20) + '...'),
                datasets: [
                    { label: 'Tỷ lệ đạt (%)', data: top10.map(e => e.passRate), backgroundColor: colors.success },
                    { label: 'Điểm TB', data: top10.map(e => e.avgScore), backgroundColor: colors.primary }
                ]
            },
            options: { responsive: true, maintainAspectRatio: false }
        });
    }

    async function loadUsers() {
        const data = await fetchApi('/api/it/advanced-analytics/users' + getFilters());
        if (!data || !data.success) return;

        const tbody = document.getElementById('anaUserTableBody');
        tbody.innerHTML = '';
        data.data.forEach(u => {
            tbody.innerHTML += `<tr>
                <td><strong>${u.name}</strong></td>
                <td>${u.dept}</td>
                <td>${u.totalEnrollments}</td>
                <td>${u.completionRate}%</td>
                <td>${u.avgScore}đ</td>
            </tr>`;
        });
        filterUsersTable();
    }

    function filterUsersTable() {
        const input = document.getElementById("anaUserSearch");
        if(!input) return;
        const filter = input.value.toLowerCase();
        const tbody = document.getElementById("anaUserTableBody");
        const tr = tbody.getElementsByTagName("tr");
        for (let i = 0; i < tr.length; i++) {
            const td = tr[i].getElementsByTagName("td")[0];
            if (td) {
                const txtValue = td.textContent || td.innerText;
                if (txtValue.toLowerCase().indexOf(filter) > -1) {
                    tr[i].style.display = "";
                } else {
                    tr[i].style.display = "none";
                }
            }
        }
    }

    return {
        init: function() {
            if (document.getElementById('anaDeptSelect').options.length <= 1) {
                loadFilterData();
            }
            this.switchTab('overview');
        },
        switchTab: function(tabId) {
            currentTab = tabId;
            document.querySelectorAll('.analytics-tabs .tab-btn').forEach(btn => btn.classList.remove('active'));
            event && event.currentTarget ? event.currentTarget.classList.add('active') : document.querySelector(`.analytics-tabs .tab-btn[onclick*="${tabId}"]`).classList.add('active');

            document.querySelectorAll('.ana-tab-content').forEach(content => content.style.display = 'none');
            document.getElementById(`ana-tab-${tabId}`).style.display = 'block';

            if (tabId === 'overview') loadOverview();
            else if (tabId === 'departments') loadDepartments();
            else if (tabId === 'courses') loadCourses();
            else if (tabId === 'exams') loadExams();
            else if (tabId === 'users') loadUsers();
        },
        applyFilters: function() {
            this.switchTab(currentTab);
        },
        viewDeptUsers: function(deptId) {
            document.getElementById('anaDeptSelect').value = deptId;
            this.switchTab('users');
        },
        filterUsersTable: filterUsersTable,
        exportReport: function() {
            alert("Tính năng Xuất báo cáo CSV đang được cập nhật!");
        }
    };
})();
