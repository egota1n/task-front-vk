import React, { useEffect, useState, useReducer, useCallback } from 'react';
import axios from 'axios';
import { List, Button, Input, Spin } from 'antd';

interface Item {
	id: number;
	name: string;
	description: string;
	stars: number;
}

interface State {
	items: Item[];
	loading: boolean;
	page: number;
}

const initialState: State = {
	items: [],
	loading: false,
	page: 1,
};

type Action =
	| { type: 'ADD_ITEMS'; payload: Item[] }
	| { type: 'SET_LOADING'; payload: boolean }
	| { type: 'INCREMENT_PAGE' }
	| { type: 'EDIT_ITEM'; payload: { id: number; name: string; description: string } }
	| { type: 'REMOVE_ITEM'; payload: number };

function reducer(state: State, action: Action): State {
	switch (action.type) {
		case 'ADD_ITEMS':
			return { ...state, items: [...state.items, ...action.payload] };
		case 'SET_LOADING':
			return { ...state, loading: action.payload };
		case 'INCREMENT_PAGE':
			return { ...state, page: state.page + 1 };
		case 'EDIT_ITEM':
			return {
				...state,
				items: state.items.map(item =>
					item.id === action.payload.id
						? { ...item, name: action.payload.name, description: action.payload.description }
						: item
				),
			};
		case 'REMOVE_ITEM':
			return { ...state, items: state.items.filter(item => item.id !== action.payload) };
		default:
			return state;
	}
}

const ItemList: React.FC = () => {
	const [state, dispatch] = useReducer(reducer, initialState);
	const [editingId, setEditingId] = useState<number | null>(null);
	const [newName, setNewName] = useState('');
	const [newDescription, setNewDescription] = useState('');

	const fetchItems = useCallback(async () => {
		dispatch({ type: 'SET_LOADING', payload: true });
		try {
			const response = await axios.get(
				`https://api.github.com/search/repositories?q=javascript&sort=stars&order=asc&page=${state.page}`,
				{
					headers: {
						
					},
				}
			);
			dispatch({ type: 'ADD_ITEMS', payload: response.data.items });
			dispatch({ type: 'INCREMENT_PAGE' });
		} catch (error) {
			console.error('Error fetching items:', error);
		} finally {
			dispatch({ type: 'SET_LOADING', payload: false });
		}
	}, [state.page]);

	const handleScroll = useCallback(() => {
		if (
			window.innerHeight + document.documentElement.scrollTop !== document.documentElement.offsetHeight ||
			state.loading
		) {
			return;
		}
		fetchItems();
	}, [fetchItems, state.loading]);

	useEffect(() => {
		fetchItems();
		window.addEventListener('scroll', handleScroll);
		return () => window.removeEventListener('scroll', handleScroll);
	}, [fetchItems, handleScroll]);

	const startEditing = (id: number, name: string, description: string) => {
		setEditingId(id);
		setNewName(name);
		setNewDescription(description);
	};

	const saveEdit = (id: number) => {
		dispatch({ type: 'EDIT_ITEM', payload: { id, name: newName, description: newDescription } });
		setEditingId(null);
	};

	const removeItem = (id: number) => {
		dispatch({ type: 'REMOVE_ITEM', payload: id });
	};

	return (
		<div>
			<List
				dataSource={state.items}
				renderItem={(item) => (
					<List.Item
						actions={[
							editingId === item.id ? (
								<Button onClick={() => saveEdit(item.id)}>Сохранить</Button>
							) : (
								<Button onClick={() => startEditing(item.id, item.name, item.description)}>
									Редактировать
								</Button>
							),
							<Button onClick={() => removeItem(item.id)} danger>
								Удалить
							</Button>,
						]}
					>
						{editingId === item.id ? (
							<div>
								<Input
									value={newName}
									onChange={(e) => setNewName(e.target.value)}
									placeholder="Имя"
								/>
								<Input
									value={newDescription}
									onChange={(e) => setNewDescription(e.target.value)}
									placeholder="Описание"
								/>
							</div>
						) : (
							<List.Item.Meta title={item.name} description={item.description} />
						)}
					</List.Item>
				)}
			/>
			{state.loading && (
				<div style={{ textAlign: 'center', padding: '10px' }}>
					<Spin />
				</div>
			)}
		</div>
	);
};

export default ItemList;