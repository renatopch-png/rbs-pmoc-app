import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { collection, getDocs, doc, deleteDoc } from "firebase/firestore";
import { ref, deleteObject } from "firebase/storage";
import { db, storage } from "../../services/firebase";
import { useAuth } from "../../contexts/AuthContext";

export default function ListaOS() {
  const navigate = useNavigate();
  const { isAdmin } = useAuth();
  const [ordens, setOrdens] = useState([]);
