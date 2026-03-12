
import { useState, useEffect } from 'react';
import { AppView, Guest, Payment, Donation, User, Room } from '../types';
import { DAILY_RATE } from '../constants';
import * as dataService from '../services/dataService';

export const useAppState = () => {
    const [currentUser, setCurrentUser] = useState<User | null>(() => {
        const session = sessionStorage.getItem('sf_auth_user');
        try {
            return session ? JSON.parse(session) : null;
        } catch (e) {
            return null;
        }
    });

    const [currentView, setView] = useState<AppView>(AppView.DASHBOARD);
    const [guests, setGuests] = useState<Guest[]>([]);
    const [rooms, setRooms] = useState<Room[]>([]);
    const [payments, setPayments] = useState<Payment[]>([]);
    const [donations, setDonations] = useState<Donation[]>([]);
    const [users, setUsers] = useState<User[]>(dataService.getUsers());
    const [admissionCauses, setAdmissionCauses] = useState<string[]>(dataService.getCauses());
    const [donationCategories, setDonationCategories] = useState<string[]>(dataService.getDonationCategories());

    useEffect(() => {
        if (currentUser) {
            setGuests(dataService.getGuests());
            setRooms(dataService.getRooms());
            setPayments(dataService.getPayments());
            setDonations(dataService.getDonations());
            setUsers(dataService.getUsers());
        }
    }, [currentUser]);

    const handleSaveCauses = (causes: string[]) => {
        setAdmissionCauses(causes);
        dataService.saveCauses(causes);
    };

    const handleSaveDonationCategories = (categories: string[]) => {
        setDonationCategories(categories);
        dataService.saveDonationCategories(categories);
    };

    const handleLoginSuccess = (user: User) => {
        setCurrentUser(user);
        sessionStorage.setItem('sf_auth_user', JSON.stringify(user));
    };

    const handleLogout = () => {
        sessionStorage.removeItem('sf_auth_user');
        setCurrentUser(null);
        setView(AppView.DASHBOARD);
    };

    const handleAddGuest = (newGuest: Guest) => {
        const updated = [...guests, newGuest];
        setGuests(updated);
        dataService.saveGuests(updated);
    };

    const handleUpdateGuest = (updatedGuest: Guest) => {
        const updated = guests.map(g => g.id === updatedGuest.id ? updatedGuest : g);
        setGuests(updated);
        dataService.saveGuests(updated);
    };

    const handleDeleteGuest = (id: string) => {
        const updated = guests.filter(g => g.id !== id);
        setGuests(updated);
        dataService.saveGuests(updated);
    };

    const handleSaveRooms = (updatedRooms: Room[]) => {
        setRooms(updatedRooms);
        dataService.saveRooms(updatedRooms);
    };

    const handleTogglePayment = (gid: string, d: string, p: boolean) => {
        let updated: Payment[];
        const ex = payments.find(pay => pay.guestId === gid && pay.fecha === d);
        if (ex) {
            updated = payments.map(pay => (pay.guestId === gid && pay.fecha === d) ? { ...pay, esPagado: p } : pay);
        } else {
            updated = [...payments, { id: Date.now().toString(), guestId: gid, fecha: d, monto: DAILY_RATE, esPagado: p }];
        }
        setPayments(updated);
        dataService.savePayments(updated);
    };

    const handleAddDonation = (d: Donation) => {
        const up = [...donations, d];
        setDonations(up);
        dataService.saveDonations(up);
    };

    const handleDeleteDonation = (id: string) => {
        const up = donations.filter(dom => dom.id !== id);
        setDonations(up);
        dataService.saveDonations(up);
    };

    const handleAddUser = (u: User) => {
        const up = [...users, u];
        setUsers(up);
        dataService.saveUsers(up);
    };

    const handleUpdateUser = (u: User) => {
        const up = users.map(user => user.id === u.id ? u : user);
        setUsers(up);
        dataService.saveUsers(up);
    };

    const handleDeleteUser = (id: string) => {
        const up = users.filter(u => u.id !== id);
        setUsers(up);
        dataService.saveUsers(up);
    };

    return {
        currentUser,
        currentView,
        guests,
        rooms,
        payments,
        donations,
        users,
        admissionCauses,
        setView,
        handleLoginSuccess,
        handleLogout,
        handleAddGuest,
        handleUpdateGuest,
        handleDeleteGuest,
        handleSaveRooms,
        handleTogglePayment,
        handleAddDonation,
        handleDeleteDonation,
        handleAddUser,
        handleUpdateUser,
        handleDeleteUser,
        handleSaveCauses,
        donationCategories,
        handleSaveDonationCategories
    };
};
