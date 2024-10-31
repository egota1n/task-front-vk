import React from 'react';
import './App.css';
import ItemList from './components/ItemList'
import { Typography } from 'antd';
const { Title } = Typography;

function App() {
  return (
    <div className="App">
      <Title level={2} className="app-title">Список репозиториев</Title>
      <ItemList />
    </div>
  );
}

export default App;
