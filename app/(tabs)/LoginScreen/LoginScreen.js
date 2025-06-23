import {
    Baloo2_400Regular,
    Baloo2_600SemiBold,
    Baloo2_800ExtraBold,
    useFonts,
} from '@expo-google-fonts/baloo-2';
import { useRouter } from 'expo-router';
import { useState } from 'react';
import {
    ActivityIndicator,
    Alert,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View
} from 'react-native';

import { sendPasswordResetEmail, signInWithEmailAndPassword } from 'firebase/auth';
import { auth } from '../../../firebaseConfig'; // adapte le chemin si besoin

import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view';

import SVG from './playschool.svg';

import { Feather } from '@expo/vector-icons';


export default function LoginScreen() {
    const [fontsLoaded] = useFonts({
        Baloo2_400Regular,
        Baloo2_600SemiBold,
        Baloo2_800ExtraBold,
    });

     const router = useRouter();

    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [loading, setLoading] = useState(false);

    if (!fontsLoaded) {
        return (
            <View style={styles.loaderContainer}>
                <ActivityIndicator size="large" color="#3498db" />
            </View>
        );
    }

    const handleLogin = async () => {
        if (!email || !password) {
            Alert.alert('Erreur', 'Veuillez remplir tous les champs');
            return;
        }

        setLoading(true);

        try {
            await signInWithEmailAndPassword(auth, email, password);
            setLoading(false);
            router.replace('/MainScreen/Home'); // navigation vers l'écran d'accueil
        } catch (error) {
            setLoading(false);
            let message = 'Identifiants incorrects';
            if (error.code === 'auth/user-not-found') {
                message = "Utilisateur non trouvé.";
            } else if (error.code === 'auth/wrong-password') {
                message = "Mot de passe incorrect.";
            } else if (error.code === 'auth/invalid-email') {
                message = "Email invalide.";
            }
            Alert.alert('Erreur', message);
        }
    };

    const handleForgotPassword = () => {
        if (!email) {
            Alert.alert(
                'Réinitialisation du mot de passe',
                'Veuillez d’abord entrer votre adresse email dans le champ prévu.'
            );
            return;
        }

        sendPasswordResetEmail(auth, email)
            .then(() => {
                Alert.alert(
                    'Email envoyé',
                    'Un lien de réinitialisation a été envoyé à votre adresse email.'
                );
            })
            .catch((error) => {
                let message = 'Une erreur est survenue.';
                if (error.code === 'auth/user-not-found') {
                    message = "Aucun utilisateur trouvé avec cet email.";
                } else if (error.code === 'auth/invalid-email') {
                    message = "Adresse email invalide.";
                }
                Alert.alert('Erreur', message);
            });
    };



    return (

        <KeyboardAwareScrollView 
            contentContainerStyle={{ flex: 1 }}>

            <View style={styles.container}>

                <View style={styles.image}>
                    <SVG width="300" height="100" />
                </View>

                <View style={styles.title}>
                    <Text style={styles.titleText}>MonApp</Text>
                </View>


                <TextInput
                    style={styles.input}
                    placeholder="Adresse email"
                    placeholderTextColor="#8B4513"
                    keyboardType="email-address"
                    autoCapitalize="none"
                    autoCorrect={false}  
                    onChangeText={setEmail}
                    value={email}
                    
                />

                <View style={styles.passwordContainer}>
                    <TextInput
                        style={styles.inputPassword}
                        placeholder="Mot de passe"
                        placeholderTextColor="#8B4513"
                        secureTextEntry={!showPassword}
                        onChangeText={setPassword}
                        value={password}
                    />
                    <TouchableOpacity onPress={() => setShowPassword(!showPassword)} style={styles.eyeIcon}>
                        <Feather name={showPassword ? 'eye-off' : 'eye'} size={24} color="#8B4513" />
                    </TouchableOpacity>
                </View>


                <TouchableOpacity onPress={handleForgotPassword}>
                    <Text style={styles.forgotText}>Mot de passe oublié ?</Text>
                </TouchableOpacity>


              <View style={styles.container_button}>
                    <TouchableOpacity style={styles.button} onPress={() => router.replace("/LoginScreen/RegisterScreen")} disabled={loading}>
                        <Text style={styles.buttonText}>{'Inscription'}</Text>
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.button}  disabled={loading} onPress={handleLogin}>
                        <Text style={styles.buttonText}>{'Se connecter'}</Text>
                    </TouchableOpacity>
              </View>


            </View>

        </KeyboardAwareScrollView>
   
    );
}

const styles = StyleSheet.create({
 
    container: {
        flex: 1,
        backgroundColor: '#B3E5FC',
        justifyContent: 'center',
        paddingHorizontal: 24,
    },
    image: {
        flexDirection: 'row',
        justifyContent: 'center',
        marginBottom: 12,
    },
    title: {
        flexDirection: 'row',
        justifyContent: 'center',
        marginBottom: 24,
    },
    titleText: {
        fontFamily: 'Baloo2_800ExtraBold',
        fontSize: 36,
        color: '#4CAF50',
    },
    input: {
        height: 48,
        borderColor: '#191970',
        borderWidth: 2,
        borderRadius: 8,
        marginBottom: 16,
        paddingHorizontal: 12,
        fontFamily: 'Baloo2_600SemiBold',
        fontSize: 16,
        color: "#8B4513",
        textDecorationStyle:'none'
    },

    passwordContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        borderColor: '#191970',
        borderWidth: 2,
        borderRadius: 8,
        marginBottom: 16,
        paddingHorizontal: 12,
      
    },
    inputPassword: {
        flex: 1,
        height: 48,
        fontFamily: 'Baloo2_600SemiBold',
        fontSize: 16,
        color: '#8B4513',
    },
    eyeIcon: {
        paddingLeft: 10,
    },

    container_button: {
        flexDirection:'row',
        justifyContent:'center'
    },
    button: {
        height: 48,
        backgroundColor: '#4CAF50',
        flex:0.5,
        marginLeft:5,
        // padding: 14,
        borderRadius: 8,
        justifyContent:'center',
        alignItems: 'center',
       
    },
    buttonText: {
        color: '#fff',
        fontSize: 18,
        fontFamily: 'Baloo2_600SemiBold',
    },

    forgotText: {
        color: '#191970',
        textAlign: 'right',
        marginBottom: 12,
        fontSize: 14,
        fontFamily: 'Baloo2_400Regular',
        textDecorationLine: 'underline',
    },
});