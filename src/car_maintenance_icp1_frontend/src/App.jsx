import React, { useState, useEffect } from 'react';
import { Actor, HttpAgent } from '@dfinity/agent';
import { idlFactory } from 'declarations/car_maintenance_icp1_backend';
import { BrowserRouter as Router, Route, Link, Routes, useNavigate, useLocation } from 'react-router-dom';
import { Principal } from '@dfinity/principal';
import 'App.css';

// 為 globalThis.crypto.getRandomValues 提供 polyfill
if (!globalThis.crypto || !globalThis.crypto.getRandomValues) {
  globalThis.crypto = {
    getRandomValues: (array) => {
      for (let i = 0; i < array.length; i++) {
        array[i] = Math.floor(Math.random() * 256);
      }
      return array;
    }
  };
}

const agent = new HttpAgent({
  host: 'http://127.0.0.1:8000',
  fetchOptions: {
    rejectUnauthorized: false
  },
  verifyQuerySignatures: false,
  disableHostCheck: true
});

if (process.env.NODE_ENV !== 'production') {
  agent.fetchRootKey().catch(err => {
    console.warn('Unable to fetch root key. Ensure dfx is running:', err);
  });
}

const actor = Actor.createActor(idlFactory, {
  agent,
  canisterId: 'bkyz2-fmaaa-aaaaa-qaaaq-cai'
});

function App() {
  const [records, setRecords] = useState([]);
  const [technicians, setTechnicians] = useState([]);
  const [nftToken, setNftToken] = useState('');
  const [progressRecord, setProgressRecord] = useState(null);
  const [nftReceipt, setNftReceipt] = useState('');
  const [customerBookings, setCustomerBookings] = useState([]);

  const fetchRecords = async () => {
    try {
      const records = await actor.getRecords();
      console.log('Fetched records:', records);
      setRecords(records);
    } catch (error) {
      console.error('Failed to fetch records:', error);
    }
  };

  const fetchTechnicians = async () => {
    try {
      const techs = await actor.getTechnicians();
      console.log('Fetched technicians:', techs);
      setTechnicians(techs);
    } catch (error) {
      console.error('Failed to fetch technicians:', error);
    }
  };

  const fetchCustomerBookings = async () => {
    try {
      const bookings = await actor.getCustomerBookings();
      console.log('Fetched customer bookings:', bookings);
      setCustomerBookings(bookings);
    } catch (error) {
      console.error('Failed to fetch customer bookings:', error);
    }
  };

  useEffect(() => {
    fetchRecords();
    fetchTechnicians();
    fetchCustomerBookings();
  }, []);

  const MaintenancePage = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const { caseId, technicianId } = location.state || {};

    const handleAddRecord = async (e) => {
      e.preventDefault();
      const form = e.target;
      const recordCaseId = form.caseId.value || caseId;
      const entryTime = form.entryTime.value;
      const carModel = form.carModel.value;
      const repairItems = form.repairItems.value;
      const recordTechnicianId = form.technicianId.value || technicianId;

      try {
        const repairItemsArray = repairItems.split(',').map(item => item.trim());
        await actor.addRecord(
          parseInt(recordCaseId),
          entryTime,
          carModel,
          repairItemsArray,
          recordTechnicianId
        );
        alert('添加記錄成功');
        fetchRecords();
        form.reset();
        navigate('/'); // 清空路由參數
      } catch (error) {
        console.error('Failed to add record:', error);
        alert('添加記錄失敗');
      }
    };

    return (
      <div>
        <h2>添加維修記錄</h2>
        <form onSubmit={handleAddRecord} key="maintenance-form">
          <div>
            <label>案件編碼</label>
            <input
              type="number"
              name="caseId"
              defaultValue={caseId || ''}
              required
              autoComplete="off"
            />
          </div>
          <div>
            <label>進場時間（例如：2025-03-25）</label>
            <input
              type="text"
              name="entryTime"
              required
              autoComplete="off"
            />
          </div>
          <div>
            <label>車型</label>
            <input
              type="text"
              name="carModel"
              required
              autoComplete="off"
            />
          </div>
          <div>
            <label>維修項目（用逗號分隔，例如：更換機油,檢查輪胎）</label>
            <input
              type="text"
              name="repairItems"
              required
              autoComplete="off"
            />
          </div>
          <div>
            <label>技師編號</label>
            <input
              type="text"
              name="technicianId"
              defaultValue={technicianId || ''}
              required
              autoComplete="off"
            />
          </div>
          <button type="submit">添加記錄</button>
        </form>

        <h2>維修記錄</h2>
        <ul>
          {records.map((record, index) => (
            <li key={index}>
              案件編碼: {record.caseId ?? '未知'}, 
              進場時間: {record.entryTime ?? '未知'}, 
              車型: {record.carModel ?? '未知'}, 
              維修項目: {Array.isArray(record.repairItems) ? record.repairItems.join(', ') : '未知'}, 
              技師編號: {record.technicianId ?? '未知'}, 
              進度: {record.progress ?? 0}%, 
              已完成項目: {Array.isArray(record.completedItems) ? record.completedItems.join(', ') : '無'}
            </li>
          ))}
        </ul>
      </div>
    );
  };

  const TechniciansPage = () => {
    const handleBookTechnician = async (e) => {
      e.preventDefault();
      const form = e.target;
      const techId = form.techId.value;
      const slot = form.slot.value;

      try {
        const success = await actor.bookTechnician(techId, slot);
        if (success) {
          alert('預約成功');
          fetchTechnicians();
          form.reset();
        } else {
          alert('預約失敗：時間段不可用或技師不存在');
        }
      } catch (error) {
        console.error('Failed to book technician:', error);
        alert('預約失敗');
      }
    };

    return (
      <div>
        <h2>技師預約</h2>
        <form onSubmit={handleBookTechnician} key="technicians-form">
          <div>
            <label>技師編號</label>
            <input
              type="text"
              name="techId"
              required
              autoComplete="off"
            />
          </div>
          <div>
            <label>預約時間段（例如：2025-03-25 10:00）</label>
            <input
              type="text"
              name="slot"
              required
              autoComplete="off"
            />
          </div>
          <button type="submit">預約</button>
        </form>

        <h2>技師列表</h2>
        <ul>
          {technicians.map((tech, index) => (
            <li key={index}>
              編號: {tech.id ?? '未知'}, 
              姓名: {tech.name ?? '未知'}, 
              資質: {Array.isArray(tech.qualifications) ? tech.qualifications.join(', ') : '未知'}, 
              評分: {tech.rating ?? 0}, 
              可用時間段: {Array.isArray(tech.availableSlots) ? tech.availableSlots.join(', ') : '無'}
            </li>
          ))}
        </ul>
      </div>
    );
  };

  const AddTechnicianPage = () => {
    const handleAddTechnician = async (e) => {
      e.preventDefault();
      const form = e.target;
      const id = form.techId.value;
      const name = form.name.value;
      const qualifications = form.qualifications.value;
      const rating = form.rating.value;
      const availableSlots = form.availableSlots.value;

      try {
        const qualificationsArray = qualifications.split(',').map(item => item.trim());
        const slotsArray = availableSlots.split(',').map(item => item.trim());
        await actor.addTechnician(
          id,
          name,
          qualificationsArray,
          parseInt(rating),
          slotsArray
        );
        alert('添加技師成功');
        fetchTechnicians();
        form.reset();
      } catch (error) {
        console.error('Failed to add technician:', error);
        alert('添加技師失敗');
      }
    };

    return (
      <div>
        <h2>新增技師</h2>
        <form onSubmit={handleAddTechnician} key="add-technician-form">
          <div>
            <label>技師編號</label>
            <input
              type="text"
              name="techId"
              required
              autoComplete="off"
            />
          </div>
          <div>
            <label>姓名</label>
            <input
              type="text"
              name="name"
              required
              autoComplete="off"
            />
          </div>
          <div>
            <label>資質（用逗號分隔，例如：汽車維修證照,電機證照）</label>
            <input
              type="text"
              name="qualifications"
              required
              autoComplete="off"
            />
          </div>
          <div>
            <label>評分（0-5）</label>
            <input
              type="number"
              name="rating"
              min="0"
              max="5"
              required
              autoComplete="off"
            />
          </div>
          <div>
            <label>可用時間段（用逗號分隔，例如：2025-03-25 10:00,2025-03-25 11:00）</label>
            <input
              type="text"
              name="availableSlots"
              required
              autoComplete="off"
            />
          </div>
          <button type="submit">新增技師</button>
        </form>
      </div>
    );
  };

  const CustomerBookingPage = () => {
    const navigate = useNavigate();

    const handleCustomerBook = async (e) => {
      e.preventDefault();
      const form = e.target;
      const caseId = form.customerCaseId.value;
      const techId = form.customerTechId.value;
      const slot = form.customerSlot.value;
      const licensePlate = form.licensePlate.value;

      try {
        const nft = await actor.customerBook(
          parseInt(caseId),
          techId,
          slot,
          licensePlate
        );
        if (nft) {
          setNftToken(nft);
          alert('預約成功，您的 NFT 標識：' + nft);
          fetchTechnicians();
          fetchCustomerBookings();
          form.reset();
          // 預約成功後，跳轉到維修記錄頁面並傳遞 caseId 和 techId
          navigate('/', { state: { caseId: parseInt(caseId), technicianId: techId } });
        } else {
          alert('預約失敗：時間段不可用或技師不存在');
        }
      } catch (error) {
        console.error('Failed to book:', error);
        alert('預約失敗');
      }
    };

    return (
      <div>
        <h2>客戶預約</h2>
        <form onSubmit={handleCustomerBook} key="customer-booking-form">
          <div>
            <label>案件編碼</label>
            <input
              type="number"
              name="customerCaseId"
              required
              autoComplete="off"
            />
          </div>
          <div>
            <label>技師編號</label>
            <input
              type="text"
              name="customerTechId"
              required
              autoComplete="off"
            />
          </div>
          <div>
            <label>預約時間段（例如：2025-03-25 10:00）</label>
            <input
              type="text"
              name="customerSlot"
              required
              autoComplete="off"
            />
          </div>
          <div>
            <label>車牌號碼</label>
            <input
              type="text"
              name="licensePlate"
              required
              autoComplete="off"
            />
          </div>
          <button type="submit">預約</button>
        </form>
        {nftToken && (
          <div>
            <h3>您的 NFT 標識</h3>
            <p>{nftToken}</p>
          </div>
        )}
      </div>
    );
  };

  const CustomerProgressPage = () => {
    const handleCheckProgress = async (caseId) => {
      try {
        const record = await actor.getCustomerProgress(parseInt(caseId));
        if (record) {
          setProgressRecord(record);
        } else {
          alert('無法找到該案件的維修進度');
          setProgressRecord(null);
        }
      } catch (error) {
        console.error('Failed to check progress:', error);
        alert('查詢失敗');
      }
    };

    return (
      <div>
        <h2>查看維修進度</h2>
        <h3>您的預約</h3>
        <ul>
          {customerBookings.map((booking, index) => (
            <li key={index}>
              案件編碼: {booking.caseId}, 
              技師編號: {booking.technicianId}, 
              預約時間: {booking.slot}, 
              車牌號碼: {booking.licensePlate}, 
              NFT 標識: {booking.nftToken}
              <button onClick={() => handleCheckProgress(booking.caseId)} style={{ marginLeft: '10px' }}>
                查看進度
              </button>
            </li>
          ))}
        </ul>
        {progressRecord && (
          <div>
            <h3>維修進度</h3>
            <p>案件編碼: {progressRecord.caseId ?? '未知'}</p>
            <p>進場時間: {progressRecord.entryTime ?? '未知'}</p>
            <p>車型: {progressRecord.carModel ?? '未知'}</p>
            <p>維修項目: {Array.isArray(progressRecord.repairItems) ? progressRecord.repairItems.join(', ') : '未知'}</p>
            <p>技師編號: {progressRecord.technicianId ?? '未知'}</p>
            <p>進度: {progressRecord.progress ?? 0}%</p>
            <p>已完成項目: {Array.isArray(progressRecord.completedItems) ? progressRecord.completedItems.join(', ') : '無'}</p>
          </div>
        )}
      </div>
    );
  };

  const TechnicianProgressPage = () => {
    const handleUpdateProgress = async (e) => {
      e.preventDefault();
      const form = e.target;
      const caseId = form.updateCaseId.value;
      const completedItem = form.completedItem.value;

      try {
        const success = await actor.updateProgress(parseInt(caseId), completedItem);
        if (success) {
          alert('更新進度成功');
          fetchRecords();
          form.reset();
        } else {
          alert('更新進度失敗：案件不存在');
        }
      } catch (error) {
        console.error('Failed to update progress:', error);
        alert('更新失敗');
      }
    };

    return (
      <div>
        <h2>技師更新進度</h2>
        <form onSubmit={handleUpdateProgress} key="update-progress-form">
          <div>
            <label>案件編碼</label>
            <input
              type="number"
              name="updateCaseId"
              required
              autoComplete="off"
            />
          </div>
          <div>
            <label>已完成項目（例如：已加機油）</label>
            <input
              type="text"
              name="completedItem"
              required
              autoComplete="off"
            />
          </div>
          <button type="submit">更新進度</button>
        </form>
      </div>
    );
  };

  const PaymentPage = () => {
    const handlePayWithCrypto = async (e) => {
      e.preventDefault();
      const form = e.target;
      const caseId = form.paymentCaseId.value;
      const amount = form.paymentAmount.value;

      try {
        const receipt = await actor.payWithCrypto(parseInt(caseId), parseInt(amount));
        if (receipt) {
          setNftReceipt(receipt);
          alert('付款成功，您的 NFT 維修單：' + receipt);
          form.reset();
        } else {
          alert('付款失敗：案件不存在或您無權付款');
        }
      } catch (error) {
        console.error('Failed to pay:', error);
        alert('付款失敗');
      }
    };

    return (
      <div>
        <h2>加密貨幣付款</h2>
        <form onSubmit={handlePayWithCrypto} key="payment-form">
          <div>
            <label>案件編碼</label>
            <input
              type="number"
              name="paymentCaseId"
              required
              autoComplete="off"
            />
          </div>
          <div>
            <label>付款金額（模擬加密貨幣金額，例如：100）</label>
            <input
              type="number"
              name="paymentAmount"
              required
              autoComplete="off"
            />
          </div>
          <button type="submit">付款</button>
        </form>
        {nftReceipt && (
          <div>
            <h3>您的 NFT 維修單</h3>
            <p>{nftReceipt}</p>
          </div>
        )}
      </div>
    );
  };

  return (
    <Router>
      <div className="App">
        <header>
          <h1>汽車維修平台</h1>
          <nav>
            <Link to="/">維修記錄</Link> | 
            <Link to="/technicians">技師預約</Link> | 
            <Link to="/add-technician">新增技師</Link> | 
            <Link to="/customer-booking">客戶預約</Link> | 
            <Link to="/customer-progress">查看進度</Link> | 
            <Link to="/technician-progress">技師更新</Link> | 
            <Link to="/payment">付款</Link>
          </nav>
        </header>
        <Routes>
          <Route path="/" element={<MaintenancePage />} />
          <Route path="/technicians" element={<TechniciansPage />} />
          <Route path="/add-technician" element={<AddTechnicianPage />} />
          <Route path="/customer-booking" element={<CustomerBookingPage />} />
          <Route path="/customer-progress" element={<CustomerProgressPage />} />
          <Route path="/technician-progress" element={<TechnicianProgressPage />} />
          <Route path="/payment" element={<PaymentPage />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;