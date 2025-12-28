// ==========================================
// 1. เชื่อมต่อ Firebase (ใช้ระบบออนไลน์เดิม)
// ==========================================
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js";
import { 
    getFirestore, collection, addDoc, onSnapshot, 
    doc, updateDoc, deleteDoc, query 
} from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";

const firebaseConfig = {
  apiKey: "AIzaSyBomWqhgW1OTz4EXkSIUZDPQGNCZSOkp7M",
  authDomain: "work-recording-system.firebaseapp.com",
  projectId: "work-recording-system",
  storageBucket: "work-recording-system.firebasestorage.app",
  messagingSenderId: "479762558012",
  appId: "1:479762558012:web:3441e1596ff28abfa1a739",
  measurementId: "G-CJ6XL68KVG"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const TASKS_COLLECTION = "tasks";

// ==========================================
// 2. ตัวแปร Global
// ==========================================
let tasks = []; 
let subjectsList = [];
let currentEditingId = null;

// ==========================================
// 3. ฟังก์ชัน Notification (จากไฟล์ใหม่)
// ==========================================
window.requestNotificationPermission = function() {
    if (!('Notification' in window)) {
        alert('เบราว์เซอร์นี้ไม่รองรับการแจ้งเตือน');
        return;
    }
    Notification.requestPermission().then(permission => {
        if (permission === 'granted') {
            alert('✅ เปิดการแจ้งเตือนเรียบร้อย!');
            showNotification('เปิดใช้งานสำเร็จ!', 'ระบบจะแจ้งเตือนเมื่อมีงานใหม่หรือใกล้กำหนดส่ง');
        } else if (permission === 'denied') {
            alert('❌ คุณปิดกั้นการแจ้งเตือนไว้');
        }
    });
}

function showNotification(title, body) {
    if (Notification.permission === 'granted') {
        new Notification(title, { body: body, icon: 'https://cdn-icons-png.flaticon.com/512/2285/2285576.png' });
    } else {
        alert(`${title}\n${body}`);
    }
}

// ==========================================
// 4. โหลดข้อมูล & จัดการงาน
// ==========================================

// โหลดวิชา (รองรับ SUBJECT_DATA จาก HTML)
async function loadSubjects() {
    if (typeof SUBJECT_DATA !== 'undefined') {
        subjectsList = SUBJECT_DATA;
    } else {
        // Fallback ถ้าไม่มีข้อมูลฝัง
        try {
            const response = await fetch('db.json');
            if (response.ok) subjectsList = await response.json();
        } catch (e) { console.error("Load subjects error", e); }
    }

    const subjectDropdown = document.getElementById('taskSubject');
    subjectDropdown.innerHTML = '<option value="" disabled selected>-- เลือกวิชา --</option>'; 
    
    subjectsList.forEach(subject => {
        const option = document.createElement('option');
        option.value = subject.name; 
        option.textContent = subject.name;
        subjectDropdown.appendChild(option);
    });
    
    const otherOption = document.createElement('option');
    otherOption.value = 'other';
    otherOption.textContent = 'วิชาอื่นๆ (พิมพ์เอง)';
    subjectDropdown.appendChild(otherOption);
}

// ฟังข้อมูล Realtime จาก Firebase
function listenToTasks() {
    const q = query(collection(db, TASKS_COLLECTION));
    document.getElementById('tasksList').innerHTML = '<div style="text-align:center; padding:20px;">⏳ กำลังโหลดข้อมูล...</div>';

    onSnapshot(q, (snapshot) => {
        tasks = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        renderTasks();
        updateStats();
    }, (error) => {
        console.error("Error: ", error);
        document.getElementById('tasksList').innerHTML = '<div style="color:red; text-align:center;">❌ โหลดข้อมูลไม่สำเร็จ</div>';
    });
}

// เรนเดอร์รายการงาน (ให้ตรงกับ CSS ใหม่)
function renderTasks() {
    const container = document.getElementById('tasksList');
    container.innerHTML = '';
    
    // เรียงงาน: ยังไม่เสร็จขึ้นก่อน -> ตามวันที่ส่ง
    const sortedTasks = [...tasks].sort((a, b) => {
        if (a.completed !== b.completed) return a.completed ? 1 : -1;
        return new Date(a.due) - new Date(b.due);
    });

    if (sortedTasks.length === 0) {
        container.innerHTML = '<p style="text-align:center; color:#999; margin-top:20px;">🎉 ไม่มีงานค้าง พักผ่อนได้!</p>';
        return;
    }

    const today = new Date(); today.setHours(0,0,0,0);

    sortedTasks.forEach(task => {
        const dueDate = new Date(task.due);
        const isOverdue = dueDate < today && !task.completed;
        const isUrgent = task.priority === 'urgent' && !task.completed;
        
        let statusClass = '';
        if (task.completed) statusClass = 'completed';
        else if (isOverdue) statusClass = 'overdue'; // เพิ่ม class overdue ถ้าต้องการสีพิเศษ
        else if (isUrgent) statusClass = 'urgent';

        const html = `
            <div class="task-item ${statusClass}">
                <div class="task-header">
                    <div class="task-title">${task.name}</div>
                    <div class="task-subject">${task.subject}</div>
                </div>
                <div class="task-details">
                    📅 กำหนดส่ง: ${formatThaiDate(dueDate)} <br>
                    🕒 สั่งเมื่อ: ${task.assignedOn || '-'} <br>
                    🔥 ความสำคัญ: ${getPriorityLabel(task.priority)}
                </div>
                ${task.description ? `<div class="task-description">${task.description}</div>` : ''}
                
                <div class="task-actions">
                    <button class="btn btn-small ${task.completed ? 'btn-warning' : 'btn-success'}" 
                            onclick="window.toggleComplete('${task.id}', ${!task.completed})">
                        ${task.completed ? '↩️ ทำซ้ำ' : '✅ เสร็จแล้ว'}
                    </button>
                    <button class="btn btn-small btn-info" onclick="window.editTask('${task.id}')">✏️ แก้ไข</button>
                    <button class="btn btn-small btn-danger" onclick="window.deleteTask('${task.id}')">🗑️ ลบ</button>
                </div>
            </div>
        `;
        container.innerHTML += html;
    });
}

// ฟังก์ชันเพิ่ม/แก้ไขงาน
window.addTask = async function() {
    const name = document.getElementById('taskName').value.trim();
    const assignedOn = document.getElementById('taskAssignedOn').value;
    const due = document.getElementById('taskDue').value; 
    const priority = document.getElementById('taskPriority').value;
    const description = document.getElementById('taskDescription').value.trim();

    if (!name || !due) { alert('❌ กรุณากรอก "ชื่องาน" และ "กำหนดส่ง"'); return; }
    
    // ตรวจสอบ dropdown วิชา
    let subject = document.getElementById('taskSubject').value;
    if (subject === 'other' || !subject) {
        subject = document.getElementById('taskSubjectOther').value.trim() || "งานทั่วไป";
    }

    const taskData = {
        name, subject, assignedOn, due, priority, description,
        updatedAt: new Date().toISOString()
    };
    
    // Default ค่า completed ถ้าเป็นงานใหม่
    if (!currentEditingId) taskData.completed = false;

    const btn = document.getElementById('submitTaskButton');
    btn.disabled = true; btn.innerText = "⏳ กำลังบันทึก...";

    try {
        if (currentEditingId) {
            await updateDoc(doc(db, TASKS_COLLECTION, currentEditingId), taskData);
            showNotification('แก้ไขงานสำเร็จ', `อัปเดตงาน "${name}" เรียบร้อยแล้ว`);
        } else {
            await addDoc(collection(db, TASKS_COLLECTION), {
                ...taskData,
                createdAt: new Date().toISOString()
            });
            showNotification('เพิ่มงานสำเร็จ', `บันทึกงาน "${name}" เรียบร้อยแล้ว`);
        }
        window.clearForm();
    } catch (e) {
        console.error("Error adding/updating: ", e);
        alert('❌ เกิดข้อผิดพลาด: ' + e.message);
    } finally {
        btn.disabled = false; btn.innerText = "➕ เพิ่มงาน";
    }
}

// Helper Functions
window.clearForm = function() {
    document.getElementById('taskName').value = '';
    document.getElementById('taskAssignedOn').value = 'ไม่ระบุ';
    document.getElementById('taskDue').value = '';
    document.getElementById('taskDescription').value = '';
    document.getElementById('taskSubject').value = '';
    document.getElementById('taskSubjectOther').style.display = 'none';
    currentEditingId = null;
    document.getElementById('submitTaskButton').innerText = "➕ เพิ่มงาน";
}

window.checkOtherSubject = function(elem) {
    const otherInput = document.getElementById('taskSubjectOther');
    otherInput.style.display = elem.value === 'other' ? 'block' : 'none';
}

window.toggleComplete = async function(id, status) {
    await updateDoc(doc(db, TASKS_COLLECTION, id), { completed: status });
}

window.deleteTask = async function(id) {
    if (confirm('ต้องการลบงานนี้ใช่ไหม?')) {
        await deleteDoc(doc(db, TASKS_COLLECTION, id));
    }
}

window.editTask = function(id) {
    const task = tasks.find(t => t.id === id);
    if (!task) return;

    currentEditingId = id;
    document.getElementById('taskName').value = task.name;
    document.getElementById('taskDue').value = task.due;
    document.getElementById('taskPriority').value = task.priority;
    document.getElementById('taskDescription').value = task.description || '';
    
    // Handle Subject
    const subjectSelect = document.getElementById('taskSubject');
    // เช็คว่าวิชามีในลิสต์ไหม ถ้าไม่มีให้เลือก 'other'
    let found = false;
    for(let i=0; i<subjectSelect.options.length; i++) {
        if(subjectSelect.options[i].value === task.subject) {
            subjectSelect.selectedIndex = i;
            found = true;
            break;
        }
    }
    if (!found) {
        subjectSelect.value = 'other';
        window.checkOtherSubject(subjectSelect);
        document.getElementById('taskSubjectOther').value = task.subject;
    } else {
        window.checkOtherSubject(subjectSelect);
    }

    // Handle AssignedOn (Dropdown)
    const assignedSelect = document.getElementById('taskAssignedOn');
    if (task.assignedOn) assignedSelect.value = task.assignedOn;

    document.getElementById('submitTaskButton').innerText = "💾 บันทึกการแก้ไข";
    document.querySelector('.config-section').scrollIntoView({ behavior: 'smooth' });
}

function updateStats() {
    const total = tasks.length;
    const completed = tasks.filter(t => t.completed).length;
    const pending = total - completed;
    
    const today = new Date(); today.setHours(0,0,0,0);
    const overdue = tasks.filter(t => new Date(t.due) < today && !t.completed).length;
    const todayTasks = tasks.filter(t => {
        const d = new Date(t.due); d.setHours(0,0,0,0);
        return d.getTime() === today.getTime() && !t.completed;
    }).length;

    document.getElementById('statsGrid').innerHTML = `
        <div class="stat-card stat-total">
            <div class="stat-number">${total}</div><div class="stat-label">งานทั้งหมด</div>
        </div>
        <div class="stat-card stat-completed">
            <div class="stat-number">${completed}</div><div class="stat-label">เสร็จแล้ว</div>
        </div>
        <div class="stat-card stat-pending">
            <div class="stat-number">${pending}</div><div class="stat-label">รอดำเนินการ</div>
        </div>
        <div class="stat-card stat-overdue">
            <div class="stat-number">${overdue}</div><div class="stat-label">เลยกำหนด</div>
        </div>
        <div class="stat-card stat-today">
            <div class="stat-number">${todayTasks}</div><div class="stat-label">งานวันนี้</div>
        </div>
    `;
}

function getPriorityLabel(p) {
    if(p==='urgent') return '🔴 เร่งด่วน';
    if(p==='important') return '🟡 สำคัญ';
    return '🟢 ปกติ';
}

function formatThaiDate(dateObj) {
    return dateObj.toLocaleDateString('th-TH', { 
        day: 'numeric', month: 'short', year: '2-digit' 
    });
}

// เริ่มการทำงาน
window.onload = function() {
    loadSubjects();
    listenToTasks();
}