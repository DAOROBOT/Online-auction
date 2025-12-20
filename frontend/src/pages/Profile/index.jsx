import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";

import { useAuth } from "../../contexts/AuthContext";
import { mockUserData } from "../../data/users";

import PersonalProfile from "./PersonalProfile";
import PublicProfile from "./PublicProfile";

export default function Profile() {
    const { id } = useParams();
    if (id) {
        return <PublicProfile />
    }
    return <PersonalProfile />
};