import React, { useState, useEffect } from 'react';
import axios from 'axios';

const API_URL = 'https://family-tree-api-6kn7.onrender.com';

const formatDisplayDate = (dateStr) => {
  if (!dateStr) return 'ບໍ່ລະບຸ';
  const match = dateStr.match(/^(\d{4})-(\d{2})-(\d{2})/);
  if (match) {
    const [, y, m, d] = match;
    if (m === '01' && d === '01') return y;
    return `${parseInt(d, 10)}/${parseInt(m, 10)}/${y}`;
  }
  return dateStr;
};

const calculateGeneration = (currentMember, membersList, visited = new Set()) => {
  if (!currentMember || visited.has(currentMember.id)) return 1;
  visited.add(currentMember.id);

  const father = membersList.find(m => m.id === currentMember.father_id);
  const mother = membersList.find(m => m.id === currentMember.mother_id);

  if (father) return calculateGeneration(father, membersList, visited) + 1;
  if (mother) return calculateGeneration(mother, membersList, visited) + 1;

  const spouse = membersList.find(m => 
    (m.id === currentMember.spouse_id || currentMember.id === m.spouse_id) && m.id !== currentMember.id
  );
  if (spouse && !visited.has(spouse.id)) {
    return calculateGeneration(spouse, membersList, visited);
  }

  return 1;
};

const MemberReportCard = ({ member, allMembers = [], user, onOpenActivityModal, lang }) => {
  const [activities, setActivities] = useState([]);
  const father = allMembers.find(m => m.id === member.father_id);
  const mother = allMembers.find(m => m.id === member.mother_id);
  const spouse = allMembers.find(m => m.id === member.spouse_id || member.id === m.spouse_id);

  const generationNumber = calculateGeneration(member, allMembers);

  useEffect(() => {
    if (member && member.id) {
      axios.get(`${API_URL}/api/activities/${member.id}`)
        .then(res => {
          if (Array.isArray(res.data)) setActivities(res.data);
        })
        .catch(err => console.log('Fetch activities error:', err));
    }
  }, [member]);

  const rowStyle = { fontSize: '15px', lineHeight: '1.6', color: '#000', textAlign: 'left' };
  const phoneNumber = member.phone || member.telephone || member.mobile || '-';

  const headerTexts = {
    lao: 'ສະມາຊິກຄອບຄົວ ມົ້ງຊົ່ງ',
    en: 'Hmong Song Family Member',
    mo: 'Tsev Neeg Hmoob Xong'
  };
  const currentHeaderTitle = headerTexts[lang] || headerTexts.lao;

  return (
    <div style={{ 
      width: '100%', maxWidth: '210mm', padding: '5mm 0', marginBottom: '15px', 
      borderBottom: '1px dashed #ccc', background: '#fff', boxSizing: 'border-box', 
      fontFamily: "'Noto Sans Lao', 'Phetsarath OT', sans-serif", color: '#000',
      pageBreakInside: 'avoid', breakInside: 'avoid'
    }}>
      <div style={{ textAlign: 'center', marginBottom: '20px', borderBottom: '2px solid #0284c7', paddingBottom: '10px' }}>
        <h2 style={{ margin: 0, color: '#0369a1', fontSize: '20px', fontWeight: 'bold' }}>
          {currentHeaderTitle} (LAUJ KAUB NYAJ)
        </h2>
      </div>

      <div style={{ display: 'flex', width: '100%', alignItems: 'flex-start', marginBottom: '8px' }}>
        <div style={{ width: '4cm', minWidth: '4cm', height: '5.2cm', minHeight: '5.2cm', marginRight: '20px', background: '#fff', overflow: 'hidden' }}>
          {member.photo_url ? (
            <img src={member.photo_url} alt="Member" style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }} />
          ) : (
            <div style={{ padding: '30px 10px', textAlign: 'center', color: '#888', fontSize: '12px', border: '1px dashed #ccc', height: '100%', boxSizing: 'border-box' }}>ບໍ່ມີຮູບພາບ</div>
          )}
        </div>

        <div style={{ flex: '1', display: 'flex', flexDirection: 'column', justifyContent: 'flex-start' }}>
          <div style={rowStyle}><strong>ຊື່ ແລະ ນາມສະກຸນ:</strong> {member.first_name} {member.last_name}</div>
          <div style={rowStyle}><strong>ຮຸ່ນ:</strong> P.{generationNumber}</div>
          <div style={rowStyle}><strong>ວັນເກີດ:</strong> {formatDisplayDate(member.birth_date)}</div>
          <div style={rowStyle}><strong>ບ້ານເກີດ:</strong> {member.birth_village || '-'}</div>
          <div style={rowStyle}><strong>ເມືອງເກີດ:</strong> {member.birth_district || '-'}</div>
          <div style={rowStyle}><strong>ແຂວງເກີດ:</strong> {member.birth_province || '-'}</div>
          <div style={rowStyle}><strong>ຄູ່ສົມລົດ:</strong> {spouse ? `${spouse.first_name} ${spouse.last_name}` : '-'}</div>
          <div style={rowStyle}><strong>ຊື່ພໍ່:</strong> {father ? `${father.first_name} ${father.last_name}` : '-'}</div>
          <div style={rowStyle}><strong>ຊື່ແມ່:</strong> {mother ? `${mother.first_name} ${mother.last_name}` : '-'}</div>
        </div>
      </div>

      <div style={{ width: '100%' }}>
        <div style={rowStyle}><strong>ບ້ານຢູ່ປະຈຸບັນ:</strong> {member.village || '-'}</div>
        <div style={rowStyle}><strong>ເມືອງ:</strong> {member.district || '-'}</div>
        <div style={rowStyle}><strong>ແຂວງ:</strong> {member.province || '-'}</div>
        <div style={rowStyle}><strong>ເບີໂທລະສັບ:</strong> {phoneNumber}</div>
        <div style={{ ...rowStyle, marginTop: '2px' }}>
          <strong>ປະຫວັດຫຍໍ້/ຂໍ້ມູນເພີ່ມເຕີມ:</strong>
          <div style={{ marginTop: '2px', lineHeight: '1.5' }}>{member.bio || ''}</div>
          {member.note && <div style={{ marginTop: '4px', color: '#be123c' }}><strong>ໝາຍເຫດ:</strong> {member.note}</div>}
        </div>
      </div>

      <div style={{ marginTop: '20px', paddingTop: '15px', borderTop: '2px solid #e2e8f0' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
          <h4 style={{ margin: '0', color: '#0369a1', fontSize: '16px', fontWeight: 'bold' }}>
            📸 ກິດຈະກຳ, ທ່ອງທ່ຽວ & ຮູບພາບຄວາມຊົງຈຳ ({activities.length})
          </h4>
          {user && user.role === 'ADMIN' && onOpenActivityModal && (
            <button 
              onClick={() => onOpenActivityModal(member)}
              className="no-print"
              style={{ background: '#0284c7', color: 'white', border: 'none', padding: '6px 12px', borderRadius: '6px', cursor: 'pointer', fontSize: '13px', fontWeight: 'bold' }}
            >
              ➕ ເພີ່ມກິດຈະກຳ
            </button>
          )}
        </div>

        {activities.length > 0 ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '15px', marginTop: '10px' }}>
            {activities.map((act) => (
              <div key={act.id} style={{ display: 'flex', width: '100%', alignItems: 'flex-start', background: '#f8fafc', padding: '10px', borderRadius: '8px', border: '1px solid #cbd5e1' }}>
                <div style={{ width: '4cm', minWidth: '4cm', height: '5.2cm', minHeight: '5.2cm', marginRight: '20px', background: '#fff', overflow: 'hidden', borderRadius: '6px', border: '1px solid #cbd5e1' }}>
                  <img src={act.photo_url} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }} />
                </div>
                <div style={{ flex: '1', display: 'flex', flexDirection: 'column', justifyContent: 'flex-start' }}>
                  <div style={rowStyle}><strong>ຫົວຂໍ້ກິດຈະກຳ:</strong> {act.title || '-'}</div>
                  <div style={rowStyle}><strong>ວັນທີ/ປີ ເຮັດກິດຈະກຳ:</strong> {act.activity_date || '-'}</div>
                  <div style={{ ...rowStyle, marginTop: '4px' }}>
                    <strong>ຄຳບັນຍາຍ / ເລົ່າເລື່ອງລາວ:</strong>
                    <div style={{ marginTop: '2px', lineHeight: '1.5', color: '#334155' }}>{act.description || '-'}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p style={{ fontSize: '13px', color: '#94a3b8', fontStyle: 'italic', margin: '5px 0' }}>ຍັງບໍ່ມີຂໍ້ມູນກິດຈະກຳ ຫຼື ຮູບພາບການທ່ອງທ່ຽວ</p>
        )}
      </div>
    </div>
  );
};

const translations = {
  lao: {
    login: 'ເຂົ້າສູ່ລະບົບ', username: 'ຊື່ຜູ້ໃຊ້', password: 'ລະຫັດຜ່ານ',
    title: 'ລະບົບຈັດການຂໍ້ມູນ & ຜັງຕະກຸນXIONG', userLabel: 'ຜູ້ໃຊ້',
    printAll: '📊 ພິມລາຍງານລວມທັງໝົດ', logout: 'ອອກຈາກລະບົບ',
    addMember: '👤 ເພີ່ມຂໍ້ມູນຍາດພີ່ນ້ອງໃໝ່', editMember: '📝 ແກ້ໄຂຂໍ້ມູນ',
    firstName: 'ຊື່', lastName: 'ນາມສະກຸນ', gender: 'ເພດ', male: 'ຊາຍ', female: 'ຍິງ',
    birthDate: 'ວັນເກີດ (ພິມ dd/mm/yyyy ຫຼື ປີ / ຫຼື ກົດເລືອກປະຕິທິນ)', birthVillage: 'ບ້ານເກີດ', birthDistrict: 'ເມືອງເກີດ', birthProvince: 'ແຂວງເກີດ',
    spouse: 'ຜົວ / ເມຍ', selectSpouse: '-- ເລືອກຄູ່ສົມລົດ --', father: 'ພໍ່', selectFather: '-- ເລືອກພໍ່ --',
    mother: 'ແມ່', selectMother: '-- ເລືອກແມ່ --', village: 'ບ້ານຢູ່ປະຈຸບັນ', district: 'ເມືອງ', province: 'ແຂວງ',
    phone: 'ເບີໂທລະສັບ', selectPhoto: 'ເລືອກຮູບພາບ', bio: 'ປະຫວັດຫຍໍ້:', save: 'ບັນທຶກ', cancel: 'ຍົກເລີກ',
    searchPlaceholder: '🔍 ຄົ້ນຫາຕາມ ຊື່, ບ້ານ...', listView: '📋 ແບບລາຍຊື່', treeView: '🌿 ແບບຜັງຕົ້ນໄມ້',
    specificReport: '📄 ໃບລາຍງານສະເພາະ', backToHome: '⬅️ ກັບຄືນໜ້າຫຼັກ', printReport: '🖨️ ພິມໃບລາຍງານ', printTree: '🖨️ ພິມຜັງຕົ້ນໄມ້',
    successTitle: 'ສຳເລັດ', ok: 'ຕົກລົງ', yes: 'ຕົກລົງ (ລຶບ)'
  },
  en: {
    login: 'Login', username: 'Username', password: 'Password',
    title: 'XIONG Family Management System', userLabel: 'User',
    printAll: '📊 Print All Reports', logout: 'Logout',
    addMember: '👤 Add New Relative', editMember: '📝 Edit Details',
    firstName: 'First Name', lastName: 'Last Name', gender: 'Gender', male: 'Male', female: 'Female',
    birthDate: 'Birth Date (dd/mm/yyyy or year)', birthVillage: 'Birth Village', birthDistrict: 'Birth District', birthProvince: 'Birth Province',
    spouse: 'Spouse', selectSpouse: '-- Select Spouse --', father: 'Father', selectFather: '-- Select Father --',
    mother: 'Mother', selectMother: '-- Select Mother --', village: 'Current Village', district: 'District', province: 'Province',
    phone: 'Phone Number', selectPhoto: 'Select Photo', bio: 'Biography / Notes:', save: 'Save', cancel: 'Cancel',
    searchPlaceholder: '🔍 Search by name, village...', listView: '📋 List View', treeView: '🌿 Tree View',
    specificReport: '📄 Individual Report', backToHome: '⬅️ Back to Main Page', printReport: '🖨️ Print Report', printTree: '🖨️ Print Tree View',
    successTitle: 'Success', ok: 'OK', yes: 'Confirm (Delete)'
  },
  mo: {
    login: 'Koom Tes', username: 'Npe Hom', password: 'Tshooj Zov',
    title: 'Kev Tswj Txeeb Hmong XIONG', userLabel: 'Meej Txiv',
    printAll: '📊 Sau Ntaub Ntawv Tag Nrho', logout: 'Tawm',
    addMember: '👤 Ntxiv Neej Tsav Tshiab', editMember: '📝 Kho Duab Ntaub Ntawv',
    firstName: 'Npe', lastName: 'Pab Npe', gender: 'Pob', male: 'Txiv', female: 'Niam',
    birthDate: 'Huv Hli (dd/mm/yyyy los yog xyoo)', birthVillage: 'Zos T yug', birthDistrict: 'Xeev T yug', birthProvince: 'Nroog T yug',
    spouse: 'Nkws', selectSpouse: '-- Txaiv Nkws --', father: 'Txiv', selectFather: '-- Txaiv Txiv --',
    mother: 'Niam', selectMother: '-- Txaiv Niam --', village: 'Zos Nyob', district: 'Xeev', province: 'Nroog',
    phone: 'Xov Tooj', selectPhoto: 'Txaiv Duab', bio: 'Keeb Kwm / Lus Ntxiv:', save: 'Ceev', cancel: 'Tso Daus',
    searchPlaceholder: '🔍 Nrhiav npe, zos...', listView: '📋 Hom Npe', treeView: '🌿 Hom Ntoo',
    specificReport: '📄 Ntaub Ntawv Ib Leej', backToHome: '⬅️ Thim Rau Qhov Qub', printReport: '🖨️ Sau Ntaub Ntawv', printTree: '🖨️ Sau Hom Ntoo',
    successTitle: 'Tau Tiav', ok: 'Ua Li Cas', yes: 'Pom Zoo (Lwv)'
  }
};

const parseDateForServer = (inputDate) => {
  if (!inputDate) return '';
  const trimmed = inputDate.trim();
  const dmyMatch = trimmed.match(/^(\d{1,2})\/(\d{1,2})\/(\d{4})$/);
  if (dmyMatch) {
    const [, d, m, y] = dmyMatch;
    return `${y}-${m.padStart(2, '0')}-${d.padStart(2, '0')}`;
  }
  const yearMatch = trimmed.match(/^(\d{4})$/);
  if (yearMatch) return `${yearMatch[1]}-01-01`;
  return trimmed;
};

const compareAge = (a, b) => {
  if (a.birth_date && b.birth_date) return new Date(a.birth_date) - new Date(b.birth_date);
  if (a.birth_date && !b.birth_date) return -1;
  if (!a.birth_date && b.birth_date) return 1;
  return a.id - b.id;
};

const sortFamilyTreeForList = (allMembers) => {
  if (!Array.isArray(allMembers)) return [];
  const visited = new Set();
  const sorted = [];

  const traversePersonAndDescendants = (person) => {
    if (!person || visited.has(person.id)) return;
    visited.add(person.id);
    sorted.push(person);

    const spouses = allMembers.filter(m => 
      (m.id === person.spouse_id || person.id === m.spouse_id) && m.id !== person.id
    ).sort(compareAge);

    if (spouses.length > 0 && person.gender === 'Male') {
      for (const wife of spouses) {
        if (!visited.has(wife.id)) {
          visited.add(wife.id);
          sorted.push(wife);
        }
        const childrenOfWife = allMembers.filter(m => 
          (m.father_id === person.id && m.mother_id === wife.id) ||
          (m.father_id === person.id && !m.mother_id && wife === spouses[0])
        ).sort(compareAge);
        for (const child of childrenOfWife) traversePersonAndDescendants(child);
      }
    } else {
      const directChildren = allMembers.filter(m => 
        (person.gender === 'Male' ? m.father_id === person.id : m.mother_id === person.id)
      ).sort(compareAge);
      for (const child of directChildren) traversePersonAndDescendants(child);
    }
  };

  const rootMembers = allMembers.filter(m => !m.father_id && !m.mother_id && (m.gender === 'Male' || !m.spouse_id)).sort(compareAge);
  for (const root of rootMembers) traversePersonAndDescendants(root);
  for (const m of allMembers) {
    if (!visited.has(m.id)) { visited.add(m.id); sorted.push(m); }
  }
  return sorted;
};

function App() {
  const [lang, setLang] = useState('lao');
  const t = translations[lang] || translations.lao;

  const [user, setUser] = useState(null);
  const [loginForm, setLoginForm] = useState({ username: '', password: '' });
  const [loginError, setLoginError] = useState('');

  const [members, setMembers] = useState([]);
  const [editingId, setEditingId] = useState(null);
  const [selectedFile, setSelectedFile] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [viewMode, setViewMode] = useState('list');
  const [reportingMember, setReportingMember] = useState(null); 
  const [isFullReport, setIsFullReport] = useState(false); 

  const [activityModalMember, setActivityModalMember] = useState(null);
  const [activityForm, setActivityForm] = useState({ title: '', description: '', activity_date: '' });
  const [activityFile, setActivityFile] = useState(null);

  const [auditLogs, setAuditLogs] = useState([]);
  const [emergencyBanner, setEmergencyBanner] = useState('');
  const [isEditingBanner, setIsEditingBanner] = useState(false);
  const [bannerInput, setBannerInput] = useState('');

  const [modalConfig, setModalConfig] = useState({ isOpen: false, title: '', message: '', onConfirm: null, isConfirm: false });

  const showAlert = (message, title = t.successTitle) => {
    setModalConfig({ isOpen: true, title, message, isConfirm: false, onConfirm: null });
  };

  const showConfirm = (message, onConfirm, title = t.successTitle) => {
    setModalConfig({ isOpen: true, title, message, isConfirm: true, onConfirm });
  };

  const closeModal = () => setModalConfig({ isOpen: false, title: '', message: '', onConfirm: null, isConfirm: false });

  const initialFormState = {
    first_name: '', last_name: '', gender: 'Male', birth_date: '', 
    birth_village: '', birth_district: '', birth_province: '',
    is_alive: true, father_id: '', mother_id: '', spouse_id: '',
    village: '', district: '', province: '', workplace: '', bio: '', photo_url: '',
    phone: '', note: ''
  };

  const [formData, setFormData] = useState(initialFormState);

  useEffect(() => {
    const savedToken = localStorage.getItem('family_tree_token');
    const savedUser = localStorage.getItem('family_tree_user');
    const savedRole = localStorage.getItem('family_tree_role');
    if (savedToken && savedUser && savedRole) {
      setUser({ username: savedUser, role: savedRole, token: savedToken });
    }
    fetchAuditLogs();
    fetchEmergencyBanner();
  }, []);

  const fetchMembers = async () => {
    const token = localStorage.getItem('family_tree_token');
    if (!token) return;
    try {
      const res = await axios.get(`${API_URL}/api/members`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (Array.isArray(res.data)) {
        setMembers(res.data);
      } else {
        setMembers([]);
      }
    } catch (err) {
      if (err.response?.status === 401 || err.response?.status === 403) handleLogout();
    }
  };

  const fetchAuditLogs = async () => {
    try {
      const res = await axios.get(`${API_URL}/api/audit-logs`);
      if (Array.isArray(res.data)) {
        setAuditLogs(res.data);
      }
    } catch (err) { console.log(err); }
  };

  const fetchEmergencyBanner = async () => {
    try {
      const res = await axios.get(`${API_URL}/api/emergency-banner`);
      setEmergencyBanner(res.data?.message || '');
      setBannerInput(res.data?.message || '');
    } catch (err) { console.log(err); }
  };

  const handleSaveBanner = async () => {
    try {
      await axios.post(`${API_URL}/api/emergency-banner`, { message: bannerInput }, {
        headers: { Authorization: `Bearer ${user.token}` }
      });
      setEmergencyBanner(bannerInput);
      setIsEditingBanner(false);
      showAlert('ອັບເດດປະກາດຂ່າວສຸກເສີນສຳເລັດ!');
      fetchAuditLogs();
    } catch (err) { showAlert(err.response?.data?.error || err.message); }
  };

  useEffect(() => { if (user) fetchMembers(); }, [user]);

  const handleLoginSubmit = async (e) => {
    e.preventDefault();
    setLoginError('');
    try {
      const res = await axios.post(`${API_URL}/api/login`, loginForm);
      const { token, username, role } = res.data;
      localStorage.setItem('family_tree_token', token);
      localStorage.setItem('family_tree_user', username);
      localStorage.setItem('family_tree_role', role);
      setUser({ username, role, token });
      setLoginForm({ username: '', password: '' });
      fetchAuditLogs();
      fetchEmergencyBanner();
    } catch (err) {
      setLoginError(err.response?.data?.error || 'ເກີດຂໍ້ຜິດພາດໃນການເຊື່ອມຕໍ່ Server');
    }
  };

  const handleLogout = () => { localStorage.clear(); setUser(null); setMembers([]); };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) setSelectedFile(file);
  };

  const handleEdit = (member) => {
    if (user.role !== 'ADMIN') {
      showAlert('ສິດ USER ບໍ່ສາມາດແກ້ໄຂຂໍ້ມູນໄດ້ (ສະເພາະ ADMIN ເທົ່ານັ້ນ)');
      return;
    }
    setEditingId(member.id);
    setSelectedFile(null);

    let formattedBirth = member.birth_date ? member.birth_date.split('T')[0] : '';
    if (/^\d{4}-01-01$/.test(formattedBirth)) formattedBirth = formattedBirth.split('-')[0];
    else if (/^\d{4}-\d{2}-\d{2}$/.test(formattedBirth)) {
      const [y, m, d] = formattedBirth.split('-');
      formattedBirth = `${parseInt(d, 10)}/${parseInt(m, 10)}/${y}`;
    }

    setFormData({
      first_name: member.first_name || '', last_name: member.last_name || '',
      gender: member.gender || 'Male', birth_date: formattedBirth,
      birth_village: member.birth_village || '', birth_district: member.birth_district || '',
      birth_province: member.birth_province || '', is_alive: member.is_alive ?? true,
      father_id: member.father_id || '', mother_id: member.mother_id || '',
      spouse_id: member.spouse_id || '', village: member.village || '',
      district: member.district || '', province: member.province || '',
      workplace: member.workplace || '', bio: member.bio || '',
      photo_url: member.photo_url || '', phone: member.phone || '', note: member.note || ''
    });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleCancelEdit = () => { setEditingId(null); setSelectedFile(null); setFormData(initialFormState); };

  const handleDelete = async (id, name) => {
    if (user.role !== 'ADMIN') {
      showAlert('ສິດ USER ບໍ່ສາມາດລຶບຂໍ້ມູນໄດ້ (ສະເພາະ ADMIN ເທົ່ານັ້ນ)');
      return;
    }
    showConfirm(`ທ່ານຕ້ອງການລຶບຂໍ້ມູນຂອງ "${name}" ແທ້ບໍ?`, async () => {
      try {
        await axios.delete(`${API_URL}/api/members/${id}`, { headers: { Authorization: `Bearer ${user.token}` } });
        showAlert('ລຶບຂໍ້ມູນສຳເລັດ!');
        fetchMembers();
        fetchAuditLogs();
      } catch (err) { showAlert(err.response?.data?.error || err.message); }
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const data = new FormData();
    data.append('first_name', formData.first_name);
    data.append('last_name', formData.last_name);
    data.append('gender', formData.gender);
    data.append('birth_date', parseDateForServer(formData.birth_date) || '');
    data.append('birth_village', formData.birth_village || '');
    data.append('birth_district', formData.birth_district || '');
    data.append('birth_province', formData.birth_province || '');
    data.append('father_id', formData.father_id ? parseInt(formData.father_id) : '');
    data.append('mother_id', formData.mother_id ? parseInt(formData.mother_id) : '');
    data.append('spouse_id', formData.spouse_id ? parseInt(formData.spouse_id) : '');
    data.append('village', formData.village || '');
    data.append('district', formData.district || '');
    data.append('province', formData.province || '');
    data.append('workplace', formData.workplace || '');
    data.append('bio', formData.bio || '');
    data.append('phone', formData.phone || '');
    data.append('note', formData.note || '');

    if (selectedFile) data.append('photo', selectedFile);
    else if (formData.photo_url) data.append('existing_photo_url', formData.photo_url);

    try {
      const headers = { 'Content-Type': 'multipart/form-data', Authorization: `Bearer ${user.token}` };
      if (editingId) {
        await axios.put(`${API_URL}/api/members/${editingId}`, data, { headers });
        showAlert('ອັບເດດຂໍ້ມູນສຳເລັດ!');
      } else {
        await axios.post(`${API_URL}/api/members`, data, { headers });
        showAlert('ບັນທຶກຂໍ້ມູນສຳເລັດ!');
      }
      handleCancelEdit();
      fetchMembers();
      fetchAuditLogs();
    } catch (err) { showAlert(err.response?.data?.error || err.message); }
  };

  const handleActivitySubmit = async (e) => {
    e.preventDefault();
    if (!activityFile) { showAlert('ກະລຸນາເລືອກຮູບພາບກິດຈະກຳ'); return; }

    const data = new FormData();
    data.append('member_id', activityModalMember.id);
    data.append('photo', activityFile);
    data.append('title', activityForm.title);
    data.append('description', activityForm.description);
    data.append('activity_date', activityForm.activity_date);

    try {
      await axios.post(`${API_URL}/api/activities`, data, {
        headers: { 'Content-Type': 'multipart/form-data', Authorization: `Bearer ${user.token}` }
      });
      showAlert('ເພີ່ມຮູບກິດຈະກຳສຳເລັດແລ້ວ!');
      setActivityModalMember(null);
      setActivityFile(null);
      setActivityForm({ title: '', description: '', activity_date: '' });
      fetchMembers();
      fetchAuditLogs();
    } catch (err) { showAlert(err.response?.data?.error || err.message); }
  };

  const sortedMembers = sortFamilyTreeForList(members);
  const filteredMembers = sortedMembers.filter(m => {
    const fullName = `${m.first_name || ''} ${m.last_name || ''}`.toLowerCase();
    const location = `${m.village || ''} ${m.district || ''} ${m.province || ''} ${m.birth_village || ''} ${m.birth_district || ''} ${m.birth_province || ''}`.toLowerCase();
    return fullName.includes(searchTerm.toLowerCase()) || location.includes(searchTerm.toLowerCase());
  });

  const renderMemberCard = (member) => {
    const generationNumber = calculateGeneration(member, members);
    const maleSilhouetteSvg = <svg viewBox="0 0 24 24" width="55" height="55" fill="#64748b" style={{ margin: 'auto' }}><path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"/></svg>;
    const femaleSilhouetteSvg = <svg viewBox="0 0 24 24" width="55" height="55" fill="#64748b" style={{ margin: 'auto' }}><path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v1h16v-1c0-2.66-5.33-4-8-4z"/></svg>;

    return (
      <div key={member.id} style={{
        border: `2px solid ${member.gender === 'Male' ? '#0284c7' : '#ec4899'}`,
        background: member.gender === 'Male' ? '#f0f9ff' : '#fdf2f8',
        borderRadius: '16px', padding: '14px 10px', width: '160px', textAlign: 'center',
        boxShadow: '0 4px 6px rgba(0,0,0,0.08)', flexShrink: 0, position: 'relative'
      }}>
        <div style={{
          position: 'absolute', top: '6px', right: '8px', background: member.gender === 'Male' ? '#0284c7' : '#ec4899',
          color: '#ffffff', fontSize: '11px', fontWeight: 'bold', padding: '2px 6px', borderRadius: '6px', lineHeight: '1'
        }}>P.{generationNumber}</div>

        <div style={{ width: '90px', height: '90px', borderRadius: '50%', overflow: 'hidden', margin: '0 auto 8px auto', background: '#e2e8f0', border: `2px solid ${member.gender === 'Male' ? '#bae6fd' : '#fbcfe8'}`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          {member.photo_url ? (
            <img src={member.photo_url} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
          ) : (
            member.gender === 'Female' ? femaleSilhouetteSvg : maleSilhouetteSvg
          )}
        </div>

        <strong style={{ fontSize: '15px', color: member.gender === 'Male' ? '#0369a1' : '#be185d', display: 'block', lineHeight: '1.4' }}>
          {member.first_name} {member.last_name}
        </strong>
      </div>
    );
  };

  const renderTreeNode = (member, renderedSet = new Set()) => {
    if (!member || renderedSet.has(member.id)) return null;
    renderedSet.add(member.id);

    const spouses = members.filter(m => 
      m.id === member.spouse_id || m.spouse_id === member.id ||
      (m.gender === 'Female' && members.some(child => child.father_id === member.id && child.mother_id === m.id)) ||
      (m.gender === 'Male' && members.some(child => child.mother_id === member.id && child.father_id === m.id))
    ).sort(compareAge);

    spouses.forEach(s => renderedSet.add(s.id));

    let husband = member.gender === 'Male' ? member : (spouses.find(s => s.gender === 'Male') || null);
    let wives = member.gender === 'Female' ? [member, ...spouses.filter(s => s.gender === 'Female' && s.id !== member.id)] : spouses.filter(s => s.gender === 'Female');

    const wife1 = wives[0] || null;
    const wife2 = wives[1] || null;

    const childrenWife1 = husband && wife1 ? members.filter(m => (m.father_id === husband.id && m.mother_id === wife1.id) || (m.father_id === husband.id && !m.mother_id)).sort(compareAge) : [];
    const childrenWife2 = husband && wife2 ? members.filter(m => m.father_id === husband.id && m.mother_id === wife2.id).sort(compareAge) : [];
    const allChildren = [...childrenWife1, ...childrenWife2];

    const spouseIds = spouses.map(s => s.id);
    const childrenGeneral = members.filter(m => m.father_id === member.id || m.mother_id === member.id || spouseIds.includes(m.father_id) || spouseIds.includes(m.mother_id)).sort(compareAge);
    const targetChildren = allChildren.length > 0 ? allChildren : childrenGeneral;

    return (
      <div key={member.id} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', position: 'relative' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          {wives.length >= 2 ? (
            <>
              {renderMemberCard(wife1)}
              <div style={{ fontWeight: 'bold', color: '#ef4444', fontSize: '18px' }}>❤️</div>
              {husband ? renderMemberCard(husband) : renderMemberCard(member)}
              <div style={{ fontWeight: 'bold', color: '#ef4444', fontSize: '18px' }}>❤️</div>
              {renderMemberCard(wife2)}
            </>
          ) : wives.length === 1 && husband && husband.id !== wives[0].id ? (
            <>
              {renderMemberCard(husband)}
              <div style={{ fontWeight: 'bold', color: '#ef4444', fontSize: '18px' }}>❤️</div>
              {renderMemberCard(wives[0])}
            </>
          ) : (
            renderMemberCard(member)
          )}
        </div>

        {targetChildren.length > 0 && (
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', position: 'relative' }}>
            <div style={{ width: '3px', height: '22px', background: '#000000' }}></div>
            {targetChildren.length === 1 ? (
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                <div style={{ width: '3px', height: '18px', background: '#000000' }} />
                {renderTreeNode(targetChildren[0], new Set(renderedSet))}
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', position: 'relative' }}>
                <div style={{ position: 'absolute', top: 0, left: '80px', right: '80px', height: '3px', background: '#000000', zIndex: 1 }}></div>
                <div style={{ display: 'flex', justifyContent: 'center', gap: '20px', position: 'relative', paddingTop: '18px' }}>
                  {targetChildren.map(child => (
                    <div key={child.id} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', position: 'relative' }}>
                      <div style={{ position: 'absolute', top: '-18px', width: '3px', height: '18px', background: '#000000', zIndex: 2 }} />
                      {renderTreeNode(child, new Set(renderedSet))}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    );
  };

  const rootMembers = members.filter(m => !m.father_id && !m.mother_id && (m.gender === 'Male' || !m.spouse_id)).sort(compareAge);

  const LanguageSelect = () => (
    <select value={lang} onChange={(e) => setLang(e.target.value)} style={{ padding: '6px 12px', borderRadius: '6px', border: '2px solid #0284c7', fontWeight: 'bold', cursor: 'pointer', backgroundColor: '#ffffff', color: '#0369a1', fontSize: '14px' }}>
      <option value="lao">LAO</option>
      <option value="en">EN</option>
      <option value="mo">MO</option>
    </select>
  );

  if (!user) {
    return (
      <div translate="no" lang={lang} style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh', background: '#f1f5f9', fontFamily: "'Noto Sans Lao', 'Phetsarath OT', sans-serif" }}>
        <link href="https://fonts.googleapis.com/css2?family=Noto+Sans+Lao:wght@400;500;600;700&display=swap" rel="stylesheet" />
        <div style={{ position: 'absolute', top: '20px', right: '20px' }}><LanguageSelect /></div>
        <div style={{ background: 'white', padding: '35px', borderRadius: '12px', boxShadow: '0 4px 15px rgba(0,0,0,0.1)', width: '100%', maxWidth: '380px', position: 'relative' }}>
          <h2 style={{ textAlign: 'center', color: '#1e293b', marginTop: 0, marginBottom: '20px', fontWeight: 'bold', fontSize: '22px' }}>🌳 {t.login}</h2>
          {loginError && <div style={{ background: '#fee2e2', color: '#991b1b', padding: '10px', borderRadius: '6px', marginBottom: '15px', fontSize: '14px', textAlign: 'center' }}>{loginError}</div>}
          <form onSubmit={handleLoginSubmit}>
            <div style={{ marginBottom: '15px' }}><label style={{ display: 'block', marginBottom: '5px', color: '#475569', fontWeight: 'bold' }}>{t.username}</label><input type="text" required value={loginForm.username} onChange={e => setLoginForm({...loginForm, username: e.target.value})} style={inputStyle} /></div>
            <div style={{ marginBottom: '20px' }}><label style={{ display: 'block', marginBottom: '5px', color: '#475569', fontWeight: 'bold' }}>{t.password}</label><input type="password" required value={loginForm.password} onChange={e => setLoginForm({...loginForm, password: e.target.value})} style={inputStyle} /></div>
            <button type="submit" style={{ width: '100%', background: '#0284c7', color: 'white', border: 'none', padding: '11px', borderRadius: '6px', cursor: 'pointer', fontSize: '16px', fontWeight: 'bold' }}>🔒 {t.login}</button>
          </form>
          <div style={{ textAlign: 'center', marginTop: '20px', fontSize: '12px', color: '#94a3b8' }}>
            System Version: <strong>v1.1.0</strong>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div translate="no" lang={lang} style={{ padding: '20px', maxWidth: '1200px', margin: '0 auto', fontFamily: "'Noto Sans Lao', 'Phetsarath OT', sans-serif" }}>
      <link href="https://fonts.googleapis.com/css2?family=Noto+Sans+Lao:wght@400;500;600;700&display=swap" rel="stylesheet" />
      <style>{`
        * { font-family: 'Noto Sans Lao', 'Phetsarath OT', sans-serif !important; } 
        @media print { 
          @page { size: landscape; margin: 10mm; } 
          .no-print { display: none !important; } 
          body { background: white; margin: 0; padding: 0; } 
          .print-tree-container { width: 100% !important; overflow: visible !important; transform: scale(0.9); transform-origin: top left; }
        }
      `}</style>

      {(emergencyBanner || (user && (user.username === 'XIONG_ADMIN' || user.username === 'XIONG_XY'))) && (
        <div style={{ background: '#fef2f2', border: '2px solid #ef4444', borderRadius: '10px', padding: '15px 20px', marginBottom: '20px', boxShadow: '0 4px 10px rgba(239, 68, 68, 0.15)' }} className="no-print">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <h3 style={{ margin: '0 0 5px 0', color: '#dc2626', fontSize: '17px', fontWeight: 'bold' }}>
              ▲ ປະກາດຂ່າວສຸກເສີນ / ຄວາມສຳຄັນດ່ວນ / ງານສຳຄັນ ແລະ ອື່ນໆ
            </h3>
            {(user.username === 'XIONG_ADMIN' || user.username === 'XIONG_XY') && (
              <button onClick={() => setIsEditingBanner(!isEditingBanner)} style={{ background: '#ef4444', color: 'white', border: 'none', padding: '5px 12px', borderRadius: '6px', cursor: 'pointer', fontSize: '13px', fontWeight: 'bold' }}>
                {isEditingBanner ? 'ຍົກເລີກ' : '✏️ ຈັດການປະກາດ'}
              </button>
            )}
          </div>

          {isEditingBanner ? (
            <div style={{ marginTop: '10px' }}>
              <textarea value={bannerInput} onChange={e => setBannerInput(e.target.value)} placeholder="ພິມຂໍ້ຄວາມປະກາດດ່ວນ..." style={{ width: '100%', height: '70px', padding: '8px', borderRadius: '6px', border: '1px solid #f87171', fontSize: '15px' }} />
              <div style={{ marginTop: '5px', textAlign: 'right' }}>
                <button onClick={handleSaveBanner} style={{ background: '#16a34a', color: 'white', border: 'none', padding: '6px 15px', borderRadius: '6px', fontWeight: 'bold', cursor: 'pointer' }}>💾 ບັນທຶກປະກາດ</button>
              </div>
            </div>
          ) : (
            <p style={{ margin: '5px 0 0 0', color: '#991b1b', fontSize: '16px', fontWeight: '500', lineHeight: '1.5' }}>
              {emergencyBanner || 'ຍັງບໍ່ມີປະກາດຂ່າວສຸກເສີນໃນຕອນນີ້'}
            </p>
          )}
        </div>
      )}

      {activityModalMember && (
        <div style={{ position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh', background: 'rgba(0, 0, 0, 0.5)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 9999 }}>
          <div style={{ background: 'white', padding: '25px', borderRadius: '16px', boxShadow: '0 10px 25px rgba(0,0,0,0.2)', width: '100%', maxWidth: '450px' }}>
            <h3 style={{ margin: '0 0 15px 0', color: '#0369a1', fontSize: '18px', fontWeight: 'bold' }}>
              📸 ເພີ່ມຮູບກິດຈະກຳ: {activityModalMember.first_name} {activityModalMember.last_name}
            </h3>
            <form onSubmit={handleActivitySubmit}>
              <div style={{ marginBottom: '12px' }}><label style={labelStyle}>ເລືອກຮູບພາບກິດຈະກຳ:</label><input type="file" accept="image/*" required onChange={e => setActivityFile(e.target.files[0])} style={inputStyle} /></div>
              <div style={{ marginBottom: '12px' }}><label style={labelStyle}>ຫົວຂໍ້ກິດຈະກຳ (ເຊັ່ນ: ທ່ອງທ່ຽວ, ງານລ້ຽງ...):</label><input type="text" placeholder="ພິມຫົວຂໍ້..." value={activityForm.title} onChange={e => setActivityForm({...activityForm, title: e.target.value})} style={inputStyle} /></div>
              <div style={{ marginBottom: '12px' }}><label style={labelStyle}>ວັນທີ/ປີ ເຮັດກິດຈະກຳ:</label><input type="text" placeholder="ເຊັ່ນ: 15/05/2025 ຫລື 2025" value={activityForm.activity_date} onChange={e => setActivityForm({...activityForm, activity_date: e.target.value})} style={inputStyle} /></div>
              <div style={{ marginBottom: '15px' }}><label style={labelStyle}>ຄຳບັນຍາຍ / ເລົ່າເລື່ອງລາວ:</label><textarea placeholder="ພິມອະທິບາຍກິດຈະກຳ..." value={activityForm.description} onChange={e => setActivityForm({...activityForm, description: e.target.value})} style={{ ...inputStyle, height: '70px' }}></textarea></div>
              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
                <button type="button" onClick={() => setActivityModalMember(null)} style={{ background: '#cbd5e1', color: '#334155', border: 'none', padding: '8px 18px', borderRadius: '6px', fontWeight: 'bold', cursor: 'pointer' }}>{t.cancel}</button>
                <button type="submit" style={{ background: '#0284c7', color: 'white', border: 'none', padding: '8px 20px', borderRadius: '6px', fontWeight: 'bold', cursor: 'pointer' }}>💾 ບັນທຶກຮູບພາບ</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {modalConfig.isOpen && (
        <div style={{ position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh', background: 'rgba(0, 0, 0, 0.5)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 9999 }}>
          <div style={{ background: 'white', padding: '25px 30px', borderRadius: '16px', boxShadow: '0 10px 25px rgba(0,0,0,0.2)', width: '100%', maxWidth: '400px', textAlign: 'center' }}>
            <h3 style={{ margin: '0 0 10px 0', color: '#1e293b', fontSize: '20px', fontWeight: 'bold' }}>{modalConfig.title}</h3>
            <p style={{ margin: '0 0 20px 0', color: '#475569', fontSize: '16px', lineHeight: '1.5' }}>{modalConfig.message}</p>
            <div style={{ display: 'flex', justifyContent: 'center', gap: '12px' }}>
              {modalConfig.isConfirm ? (
                <>
                  <button onClick={closeModal} style={{ background: '#cbd5e1', color: '#334155', border: 'none', padding: '10px 20px', borderRadius: '8px', fontWeight: 'bold', cursor: 'pointer', fontSize: '15px' }}>{t.cancel}</button>
                  <button onClick={() => { modalConfig.onConfirm?.(); closeModal(); }} style={{ background: '#ef4444', color: 'white', border: 'none', padding: '10px 20px', borderRadius: '8px', fontWeight: 'bold', cursor: 'pointer', fontSize: '15px' }}>{t.yes}</button>
                </>
              ) : (
                <button onClick={closeModal} style={{ background: '#0284c7', color: 'white', border: 'none', padding: '10px 25px', borderRadius: '8px', fontWeight: 'bold', cursor: 'pointer', fontSize: '15px', width: '100%' }}>{t.ok}</button>
              )}
            </div>
          </div>
        </div>
      )}

      {reportingMember ? (
        <div style={{ marginBottom: '30px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '15px' }} className="no-print">
            <button onClick={() => setReportingMember(null)} style={{ background: '#64748b', color: 'white', border: 'none', padding: '8px 16px', borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold' }}>{t.backToHome}</button>
            <button onClick={() => window.print()} style={{ background: '#3b82f6', color: 'white', border: 'none', padding: '8px 16px', borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold' }}>{t.printReport}</button>
          </div>
          <MemberReportCard member={reportingMember} allMembers={members} user={user} onOpenActivityModal={m => setActivityModalMember(m)} lang={lang} />
        </div>
      ) : isFullReport ? (
        <div style={{ marginBottom: '30px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '15px' }} className="no-print">
            <button onClick={() => setIsFullReport(false)} style={{ background: '#64748b', color: 'white', border: 'none', padding: '8px 16px', borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold' }}>{t.backToHome}</button>
            <button onClick={() => window.print()} style={{ background: '#0d9488', color: 'white', border: 'none', padding: '8px 16px', borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold' }}>{t.printAll}</button>
          </div>
          <div>
            {members.length > 0 ? (
              members.map((m) => (
                <MemberReportCard key={m.id} member={m} allMembers={members} user={user} onOpenActivityModal={mem => setActivityModalMember(mem)} lang={lang} />
              ))
            ) : (
              <p style={{ textAlign: 'center', color: '#64748b' }}>ຍັງບໍ່ມີຂໍ້ມູນຍາດພີ່ນ້ອງໃນລະບົບ</p>
            )}
          </div>
        </div>
      ) : (
        <>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', background: '#e2e8f0', padding: '12px 20px', borderRadius: '10px' }} className="no-print">
            <div>👤 {t.userLabel}: <strong>{user.username}</strong> | <span style={{ background: user.role === 'ADMIN' ? '#ef4444' : '#3b82f6', color: 'white', padding: '2px 8px', borderRadius: '12px', fontSize: '12px', fontWeight: 'bold' }}>{user.role}</span></div>
            <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
              <button onClick={() => setIsFullReport(true)} style={{ background: '#0d9488', color: 'white', border: 'none', padding: '8px 14px', borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold' }}>{t.printAll}</button>
              <LanguageSelect />
              <button onClick={handleLogout} style={{ background: '#64748b', color: 'white', border: 'none', padding: '6px 14px', borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold' }}>{t.logout}</button>
            </div>
          </div>

          <div style={{ background: '#f8fafc', border: '1px solid #cbd5e1', borderRadius: '10px', padding: '15px 20px', marginBottom: '20px' }} className="no-print">
            <h3 style={{ margin: '0 0 12px 0', color: '#0369a1', fontSize: '16px', fontWeight: 'bold' }}>
              📋 ປະຫວັດການເຄື່ອນໄຫວລ່າສຸດ (Recent Updates)
            </h3>
            {auditLogs.length > 0 ? (
              <ol style={{ margin: 0, paddingLeft: '20px', fontSize: '14px', color: '#334155', lineHeight: '1.8' }}>
                {auditLogs.map((log) => {
                  const matchEdit = log.action_text?.match(/ແກ້ໄຂຂໍ້ມູນຂອງ:\s*(.+)/);
                  const matchAdd = log.action_text?.match(/ເພີ່ມຂໍ້ມູນສະມາຊິກໃໝ່:\s*(.+)/);
                  const targetName = matchEdit ? matchEdit[1].trim() : (matchAdd ? matchAdd[1].trim() : null);
                  const foundMember = targetName ? members.find(m => `${m.first_name} ${m.last_name}`.trim() === targetName || m.first_name.trim() === targetName) : null;

                  return (
                    <li key={log.id} style={{ marginBottom: '8px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '10px' }}>
                      <div>
                        <span>{log.action_text}&nbsp;&nbsp;&nbsp;</span> 
                        <span style={{ color: '#64748b', fontSize: '12px' }}>({new Date(log.created_at).toLocaleString()})</span>
                      </div>
                      {foundMember && (
                        <button 
                          onClick={() => setReportingMember(foundMember)}
                          style={{ background: '#0284c7', color: 'white', border: 'none', padding: '4px 10px', borderRadius: '4px', cursor: 'pointer', fontSize: '12px', fontWeight: 'bold' }}
                        >
                          👁️ ເບິ່ງລາຍງານ
                        </button>
                      )}
                    </li>
                  );
                })}
              </ol>
            ) : (
              <p style={{ margin: '0', fontSize: '13px', color: '#94a3b8', fontStyle: 'italic' }}>ຍັງບໍ່ມີປະຫວັດການເຄື່ອນໄຫວ</p>
            )}
          </div>

          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
            <h1 style={{ color: '#1a365d', margin: 0, fontSize: '26px', fontWeight: 'bold' }}>🌳 {t.title}</h1>
          </div>

          <div style={{ background: editingId ? '#fefce8' : '#f8fafc', padding: '25px', borderRadius: '12px', border: `2px solid ${editingId ? '#eab308' : '#cbd5e1'}`, marginBottom: '30px' }} className="no-print">
            <h2 style={{ fontSize: '18px', color: '#334155', marginTop: 0 }}>{editingId ? t.editMember : t.addMember}</h2>
            <form onSubmit={handleSubmit} style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px' }}>
              <div><label style={labelStyle}>{t.firstName}</label><input type="text" required value={formData.first_name} onChange={e => setFormData({...formData, first_name: e.target.value})} style={inputStyle} /></div>
              <div><label style={labelStyle}>{t.lastName}</label><input type="text" required value={formData.last_name} onChange={e => setFormData({...formData, last_name: e.target.value})} style={inputStyle} /></div>
              <div><label style={labelStyle}>{t.gender}</label><select value={formData.gender} onChange={e => setFormData({...formData, gender: e.target.value})} style={inputStyle}><option value="Male">{t.male}</option><option value="Female">{t.female}</option></select></div>
              
              <div>
                <label style={labelStyle}>{t.birthDate}</label>
                <div style={{ display: 'flex', gap: '8px' }}>
                  <input type="text" placeholder="15/3/1973 ຫລື 1973" value={formData.birth_date} onChange={e => setFormData({...formData, birth_date: e.target.value})} style={inputStyle} />
                  <input type="date" onChange={e => { if (e.target.value) { const [y, m, d] = e.target.value.split('-'); setFormData({...formData, birth_date: `${parseInt(d, 10)}/${parseInt(m, 10)}/${y}`}); } }} style={{ width: '45px', padding: '4px', cursor: 'pointer', borderRadius: '6px', border: '1px solid #cbd5e1', background: '#f8fafc' }} title="ເລືອກຈາກປະຕິທິນ" />
                </div>
              </div>

              <div><label style={labelStyle}>{t.birthVillage}:</label><input type="text" placeholder="ຊື່ບ້ານເກີດ..." value={formData.birth_village} onChange={e => setFormData({...formData, birth_village: e.target.value})} style={inputStyle} /></div>
              <div><label style={labelStyle}>{t.birthDistrict}:</label><input type="text" placeholder="ຊື່ເມືອງເກີດ..." value={formData.birth_district} onChange={e => setFormData({...formData, birth_district: e.target.value})} style={inputStyle} /></div>
              <div style={{ gridColumn: 'span 2' }}><label style={labelStyle}>{t.birthProvince}:</label><input type="text" placeholder="ຊື່ແຂວງເກີດ..." value={formData.birth_province} onChange={e => setFormData({...formData, birth_province: e.target.value})} style={inputStyle} /></div>
              
              <div style={{ gridColumn: 'span 2' }}>
                <label style={labelStyle}>💍 {t.spouse}:</label>
                <select value={formData.spouse_id} onChange={e => setFormData({...formData, spouse_id: e.target.value})} style={inputStyle}>
                  <option value="">{t.selectSpouse}</option>
                  <option value="">-- ເລືອກ --</option>
                  {members.filter(m => m.id !== editingId).map(m => {
                    const fObj = members.find(f => f.id === m.father_id);
                    const displayName = fObj ? `${m.first_name} (${fObj.first_name})` : `${m.first_name} ${m.last_name || ''}`;
                    return (<option key={m.id} value={m.id}>{displayName}</option>);
                  })}
                </select>
              </div>

              <div>
                <label style={labelStyle}>{t.father}:</label>
                <select value={formData.father_id} onChange={e => setFormData({...formData, father_id: e.target.value})} style={inputStyle}>
                  <option value="">{t.selectFather}</option>
                  {members.filter(m => m.gender === 'Male' && m.id !== editingId).map(m => {
                    const fObj = members.find(f => f.id === m.father_id);
                    const fName = fObj ? ` (${fObj.first_name})` : '';
                    return (<option key={m.id} value={m.id}>{m.first_name}{fName}</option>);
                  })}
                </select>
              </div>

              <div>
                <label style={labelStyle}>{t.mother}:</label>
                <select value={formData.mother_id} onChange={e => setFormData({...formData, mother_id: e.target.value})} style={inputStyle}>
                  <option value="">{t.selectMother}</option>
                  {members.filter(m => m.gender === 'Female' && m.id !== editingId).map(m => {
                    const fObj = members.find(f => f.id === m.father_id);
                    const displayName = fObj ? `${m.first_name} (${fObj.first_name})` : `${m.first_name} ${m.last_name || ''}`;
                    return (<option key={m.id} value={m.id}>{displayName}</option>);
                  })}
                </select>
              </div>

              <div><label style={labelStyle}>{t.village}:</label><input type="text" value={formData.village} onChange={e => setFormData({...formData, village: e.target.value})} style={inputStyle} /></div>
              <div><label style={labelStyle}>{t.district}:</label><input type="text" value={formData.district} onChange={e => setFormData({...formData, district: e.target.value})} style={inputStyle} /></div>
              <div><label style={labelStyle}>{t.province}:</label><input type="text" value={formData.province} onChange={e => setFormData({...formData, province: e.target.value})} style={inputStyle} /></div>
              <div><label style={labelStyle}>{t.phone}:</label><input type="text" placeholder="ເຊັ່ນ: 020 55551234" value={formData.phone} onChange={e => setFormData({...formData, phone: e.target.value})} style={inputStyle} /></div>

              <div style={{ gridColumn: 'span 2' }}><label style={labelStyle}>{t.selectPhoto}:</label><input type="file" accept="image/*" onChange={handleFileChange} style={inputStyle} /></div>
              <div style={{ gridColumn: 'span 2' }}><label style={labelStyle}>{t.bio}</label><textarea value={formData.bio} onChange={e => setFormData({...formData, bio: e.target.value})} style={{ ...inputStyle, height: '60px' }}></textarea></div>
              
              <div style={{ gridColumn: 'span 2', textAlign: 'center' }}>
                <button type="submit" style={{ background: '#0d9488', color: 'white', padding: '10px 25px', border: 'none', borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold' }}>💾 {t.save}</button>
                {editingId && <button type="button" onClick={handleCancelEdit} style={{ background: '#ef4444', color: 'white', padding: '10px 25px', border: 'none', borderRadius: '6px', cursor: 'pointer', marginLeft: '10px' }}>{t.cancel}</button>}
              </div>
            </form>
          </div>

          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', gap: '15px' }} className="no-print">
            <input type="text" placeholder={t.searchPlaceholder} value={searchTerm} onChange={e => setSearchTerm(e.target.value)} style={{ flex: 1, padding: '10px 15px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '15px' }} />
            <div style={{ display: 'flex', gap: '5px', background: '#e2e8f0', padding: '4px', borderRadius: '8px' }}>
              <button onClick={() => setViewMode('list')} style={{ background: viewMode === 'list' ? 'white' : 'transparent', border: 'none', padding: '8px 15px', borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold' }}>{t.listView} ({filteredMembers.length})</button>
              <button onClick={() => setViewMode('tree')} style={{ background: viewMode === 'tree' ? 'white' : 'transparent', border: 'none', padding: '8px 15px', borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold' }}>{t.treeView}</button>
              {viewMode === 'tree' && <button onClick={() => window.print()} style={{ background: '#3b82f6', color: 'white', border: 'none', padding: '8px 15px', borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold', marginLeft: '10px' }}>{t.printTree}</button>}
            </div>
          </div>

          {viewMode === 'list' ? (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '20px' }}>
              {filteredMembers.map(member => (
                <div key={member.id} style={{ border: '1px solid #e2e8f0', padding: '15px', borderRadius: '10px', background: 'white' }}>
                  <div style={{ width: '100%', height: '220px', background: '#f8fafc', borderRadius: '8px', overflow: 'hidden', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '10px' }}>
                    {member.photo_url ? <img src={member.photo_url} alt="" style={{ width: '100%', height: '100%', objectFit: 'contain' }} /> : <span style={{ color: '#94a3b8' }}>ບໍ່ມີຮູບພາບ</span>}
                  </div>
                  <h3 style={{ margin: '0 0 8px 0', color: '#1d4ed8' }}>{member.first_name} {member.last_name}</h3>
                  <p style={{ margin: '3px 0', fontSize: '13px', color: '#334155' }}>📞 {t.phone}: {member.phone || '-'}</p>
                  <div style={{ display: 'flex', gap: '8px', marginTop: '12px' }} className="no-print">
                    <button onClick={() => setReportingMember(member)} style={{ flex: 1, background: '#38bdf8', color: 'white', border: 'none', padding: '6px', borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold' }}>{t.specificReport}</button>
                    {user.role === 'ADMIN' && <button onClick={() => setActivityModalMember(member)} style={{ background: '#e0e7ff', padding: '6px 8px', borderRadius: '6px', cursor: 'pointer' }} title="ເພີ່ມຮູບກິດຈະກຳ">📸</button>}
                    {user.role === 'ADMIN' && <button onClick={() => handleEdit(member)} style={{ background: '#fef08a', padding: '6px 10px', borderRadius: '6px', cursor: 'pointer' }}>✏️</button>}
                    {user.role === 'ADMIN' && <button onClick={() => handleDelete(member.id, `${member.first_name} ${member.last_name}`)} style={{ background: '#fee2e2', padding: '6px 10px', borderRadius: '6px', cursor: 'pointer' }}>🗑️</button>}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="print-tree-container" style={{ border: '1px solid #cbd5e1', padding: '20px', borderRadius: '12px', background: 'white', overflow: 'auto', maxWidth: '100%' }}>
              <h3 style={{ textAlign: 'center', color: '#334155', marginTop: 0, fontWeight: 'bold' }}>{t.treeView}</h3>
              <div style={{ display: 'inline-flex', minWidth: '100%', justifyContent: 'center', padding: '20px 10px' }}>
                {rootMembers.length > 0 ? rootMembers.map(member => renderTreeNode(member)) : <p style={{ color: '#94a3b8' }}>ຍັງບໍ່ມີຂໍ້ມູນ</p>}
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}

const labelStyle = { display: 'block', marginBottom: '4px', fontWeight: '500', color: '#334155' };
const inputStyle = { width: '100%', padding: '8px 12px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '14px', boxSizing: 'border-box' };

export default App;