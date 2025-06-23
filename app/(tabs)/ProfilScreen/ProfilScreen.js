import { useRouter } from "expo-router";
import { signOut } from "firebase/auth";
import { Alert, Button, Text, View } from "react-native";
import { auth } from "../../../firebaseConfig";

export default function ProfilScreen() {
    const router = useRouter();

    const handleLogout = async () => {
        try {
            await signOut(auth);
            router.replace("/LoginScreen/LoginScreen"); // Redirige vers l'écran de connexion
        } catch (error) {
            Alert.alert("Erreur", "Échec de la déconnexion : " + error.message);
        }
    };

    return (
        <View style={{ flex: 1, justifyContent: "center", alignItems: "center", padding: 20 }}>
            <Text style={{ marginBottom: 20, fontSize: 16 }}>Souhaites-tu te déconnecter ?</Text>
            <Button title="Se déconnecter" onPress={handleLogout} />
        </View>
    );
}