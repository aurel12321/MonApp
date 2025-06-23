



import { useRouter } from "expo-router";
import { onAuthStateChanged } from "firebase/auth";
import { useEffect, useState } from "react";
import { ActivityIndicator, View } from "react-native";
import { auth } from "../../firebaseConfig";


export default function Index() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);

  useEffect(() => {

    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      console.log("🔥 onAuthStateChanged - user:", user);
      if (user) {
        await user.reload(); // recharge les données
        if (user.emailVerified) {
          router.replace("/MainScreen/Home"); // ou la page d'accueil
        } else {
          router.replace("/LoginScreen/VerifyEmailScreen");
        }
      } else {
        router.replace("/LoginScreen/LoginScreen");
      }
      setLoading(false);
    });

    return unsubscribe;
  }, []);

  if (loading) {
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  return null;
}