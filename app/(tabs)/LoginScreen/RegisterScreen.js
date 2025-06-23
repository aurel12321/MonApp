import {
    Baloo2_400Regular,
    Baloo2_600SemiBold,
    Baloo2_800ExtraBold,
    useFonts,
} from '@expo-google-fonts/baloo-2';
import { useRouter } from 'expo-router';
import { createUserWithEmailAndPassword, sendEmailVerification } from 'firebase/auth';
import { useState } from 'react';
import {
    Alert,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View
} from 'react-native';
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view';
import Icon from 'react-native-vector-icons/FontAwesome';
import { auth } from '../../../firebaseConfig';
import SVG from './playschoolAddEvent3.svg';

import { Feather } from '@expo/vector-icons';

auth.languageCode = 'fr';

export default function RegisterScreen() {
    const router = useRouter();
    const [fontsLoaded] = useFonts({
        Baloo2_400Regular,
        Baloo2_600SemiBold,
        Baloo2_800ExtraBold,
    });

    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [confirmPassword, setConfirmPassword] = useState('');
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [loading, setLoading] = useState(false);

    const [emailError, setEmailError] = useState("");

    const isValidEmail = (email) => {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email);
      };

    const [confirmPasswordError, setConfirmPasswordError] = useState("");

    const [passwordError, setPasswordError] = useState("");

    const isStrongPassword = (password) => {
        const passwordRegex =
            /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[\W_]).{8,}$/;
        return passwordRegex.test(password);
      };

    const [canResendVerification, setCanResendVerification] = useState(false);

    const handleRegister = async () => {
        let valid = true;

        // Réinitialiser les messages d'erreur
        setEmailError('');
        setPasswordError('');
        setConfirmPasswordError('');

        // Vérification de l'email
        if (!isValidEmail(email)) {
            setEmailError("L'adresse email n'est pas valide");
            valid = false;
        }

        // Vérification du mot de passe
        if (!isStrongPassword(password)) {
            setPasswordError(
                "Le mot de passe doit contenir au minimum 8 caractères, une majuscule, un chiffre et un caractère spécial."
            );
            valid = false;
        }

        // Vérification de la confirmation du mot de passe
        if (password !== confirmPassword) {
            setConfirmPasswordError("Les mots de passe ne correspondent pas");
            valid = false;
        }

        // Si une des validations échoue, on arrête ici
        if (!valid) return;

        try {
            setLoading(true);
            const userCredential = await createUserWithEmailAndPassword(auth, email, password);
            await sendEmailVerification(userCredential.user);
            setCanResendVerification(true); // Active le bouton après succès
            Alert.alert('Succès', 'Compte créé ! Vérifie ton email.');
        } catch (error) {
            Alert.alert('Erreur', error.message);
        } finally {
            setLoading(false);
        }
    };
    const handleResendVerification = async () => {
        try {
            const user = auth.currentUser;
            if (user) {
                await user.reload(); // Rafraîchir l’état de l'utilisateur
                if (user.emailVerified) {
                    Alert.alert("Succès", "Compte vérifié avec succès !");
                    router.replace('/LoginScreen/ProfilRegisterScreen');
                } else {
                    await sendEmailVerification(user);
                    Alert.alert(
                        "Vérification",
                        "Un lien de vérification a été renvoyé à votre adresse email. Veuillez vérifier votre boîte de réception, puis appuyez à nouveau sur ce bouton."
                    );
                }
            }
        } catch (error) {
            Alert.alert("Erreur", error.message);
        }
    };

    return (
        <KeyboardAwareScrollView contentContainerStyle={{ flex: 1 }}>
            <View style={styles.container}>
                <View style={styles.topContainer}>
                    <SVG width={70} height={100} />
                    <Text style={styles.topTitle}>Création de compte</Text>
                    <TouchableOpacity style={styles.buttonBack} onPress={() => router.replace('/LoginScreen/LoginScreen')}>
                        <Icon name="arrow-left" color="#F8F8F8" size={22} />
                    </TouchableOpacity>
                </View>

                <Text style={{ fontFamily: 'Baloo2_800ExtraBold', fontSize: 18, marginBottom:5 }}>Crée tes identifiants:</Text>
                <TextInput
                    style={styles.input}
                    placeholder="Adresse email"
                    placeholderTextColor="#8B4513"
                    keyboardType="email-address"
                    autoCorrect={false} 
                    autoCapitalize="none"
                    onChangeText={(text) => {
                        setEmail(text);
                        if (emailError) setEmailError("");
                      }}
                    onBlur={() => {
                        if (!isValidEmail(email)) {
                            setEmailError("L'adresse email n'est pas valide.");
                        }
                      }}
                    value={email}
                />
                {emailError ? (
                    <Text style={styles.errorText}>{emailError}</Text>
                ) : null}

                <View style={styles.passwordContainer}>
                    <TextInput
                        style={styles.inputPassword}
                        placeholder="Mot de passe"
                        placeholderTextColor="#8B4513"
                        secureTextEntry={!showPassword}
                        onChangeText={(text) => {
                            setPassword(text);
                            if (passwordError) setPasswordError('');
                        }}
                        onBlur={() => {
                            if (!isStrongPassword(password)) {
                                setPasswordError("Le mot de passe doit contenir au minimum 8 caractères, une majuscule, un chiffre et un caractère spécial.");
                            }
                        }}
                        value={password}
                    />
                    <TouchableOpacity onPress={() => setShowPassword(!showPassword)} style={styles.eyeIcon}>
                        <Feather name={showPassword ? 'eye-off' : 'eye'} size={22} color="#8B4513" />
                    </TouchableOpacity>
                </View>
                {passwordError ? (
                    <Text style={styles.errorText}>{passwordError}</Text>
                ) : null}

               
                <View style={styles.passwordContainer}>
                    <TextInput
                        style={styles.inputPassword}
                        placeholder="Confirmer le mot de passe"
                        placeholderTextColor="#8B4513"
                        secureTextEntry={!showConfirmPassword}
                        onChangeText={(text) => {
                            setConfirmPassword(text);
                            if (confirmPasswordError) setConfirmPasswordError('');
                        }}
                        onBlur={() => {
                            if (password !== confirmPassword) {
                                setConfirmPasswordError("Les mots de passe ne correspondent pas.");
                            }
                        }}
                        value={confirmPassword}
                    />
                    <TouchableOpacity onPress={() => setShowConfirmPassword(!showConfirmPassword)} style={styles.eyeIcon}>
                        <Feather name={showConfirmPassword ? 'eye-off' : 'eye'} size={22} color="#8B4513" />
                    </TouchableOpacity>
                </View>
                {confirmPasswordError ? (
                    <Text style={styles.errorText}>{confirmPasswordError}</Text>
                ) : null}


                <TouchableOpacity style={styles.registerButton} onPress={handleRegister} disabled={loading}>
                    <Text style={styles.registerText}>{loading ? 'Chargement...' : 'Créer un compte'}</Text>
                </TouchableOpacity>

                <TouchableOpacity
                    style={[
                        styles.verifyButton,
                        !canResendVerification && { backgroundColor: '#ccc' },
                    ]}
                    onPress={handleResendVerification}
                    disabled={!canResendVerification}
                >
                    <Text style={styles.verifyText}>
                        Vérifier mon email
                    </Text>
                </TouchableOpacity>
            </View>
        </KeyboardAwareScrollView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#B3E5FC',
        paddingHorizontal: 10,
    },
    topContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        // marginBottom: 5,
        paddingVertical: 5,
        paddingHorizontal: 5,
    },
    topTitle: {
        fontFamily: 'Baloo2_800ExtraBold',
        fontSize: 20,
        color: '#4CAF50',
        marginLeft: 10,
    },
    buttonBack: {
        position: 'absolute',
        top: '10%',
        left: '95%',
        padding: 5,
    },
    input: {
        borderWidth: 2,
        padding: 10,
        marginVertical: 8,
        borderRadius: 6,
        fontSize: 16,
        fontFamily: 'Baloo2_600SemiBold',
        borderColor: '#191970',
        color: '#8B4513',
    },

    passwordContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        borderWidth: 2,
        borderColor: '#191970',
        borderRadius: 6,
        paddingHorizontal: 10,
        marginVertical: 8,
       
    },
    inputPassword: {
        flex: 1,
        height: 48,
        fontFamily: 'Baloo2_600SemiBold',
        fontSize: 16,
        color: '#8B4513',
    },
    eyeIcon: {
        paddingHorizontal: 5,
    },
      
    errorText: {
        color: 'red',
        fontSize: 13,
        marginTop: 4,
        fontFamily: 'Baloo2_600SemiBold',
      },
    registerButton: {
        height: 48,
        backgroundColor: '#4CAF50',
        borderRadius: 8,
        justifyContent: 'center',
        alignItems: 'center',
        marginTop: 10,
    },
    registerText: {
        color: 'white',
        fontFamily: 'Baloo2_800ExtraBold',
        fontSize: 18,
    },
    loaderContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },

    verifyButton: {
        height: 44,
        backgroundColor: '#2196F3',
        borderRadius: 8,
        justifyContent: 'center',
        alignItems: 'center',
        marginTop: 10,
    },
    verifyText: {
        color: 'white',
        fontFamily: 'Baloo2_600SemiBold',
        fontSize: 16,
    },
});
  