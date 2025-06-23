import { useRouter } from "expo-router";
import { useState } from "react";
import { Alert, Button, Text, View } from "react-native";
import { auth } from "../../../firebaseConfig";

export default function VerifyEmailScreen() {
    const router = useRouter();
    const [emailVerified, setEmailVerified] = useState(false);
    const [loading, setLoading] = useState(false);

    const checkEmailVerification = async () => {
        setLoading(true);
        const user = auth.currentUser;
        if (user) {
            await user.reload(); // recharge les infos depuis Firebase
            if (user.emailVerified) {
                setEmailVerified(true);
                router.replace("/LoginScreen/ProfilRegisterScreen"); // ou autre écran
            } else {
                Alert.alert("Non vérifié", "Tu n'as pas encore confirmé ton email.");
            }
        }
        setLoading(false);
    };

    return (
        <View style={{ padding: 20 }}>
            <Text style={{ marginBottom: 10 }}>
                Un email de vérification t’a été envoyé. Clique sur le lien, puis appuie sur le bouton ci-dessous.
            </Text>

            <Button
                title={loading ? "Vérification..." : "J'ai vérifié mon email"}
                onPress={checkEmailVerification}
            />
        </View>
    );
}