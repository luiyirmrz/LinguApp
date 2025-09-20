# 🔐 Guía de Configuración OAuth Real - LinguApp

Esta guía te ayudará a configurar OAuth real para Google, GitHub y Apple en lugar de usar los datos mock de desarrollo.

## 📋 Prerrequisitos

- Cuenta de Google Cloud Platform
- Cuenta de GitHub
- Cuenta de Apple Developer (para Apple Sign-In)

## 🔵 Google OAuth Setup

### Paso 1: Crear Proyecto en Google Cloud Console

1. Ve a [Google Cloud Console](https://console.cloud.google.com/)
2. Crea un nuevo proyecto o selecciona uno existente
3. Habilita la **Google Identity API**

### Paso 2: Crear Credenciales OAuth 2.0

1. Ve a **"APIs & Services" > "Credentials"**
2. Haz clic en **"Create Credentials" > "OAuth 2.0 Client IDs"**
3. Crea **3 client IDs separados**:

#### Para Web:  
- Application type: **Web application**
- Name: `LinguApp Web`
- Authorized redirect URIs:
  ```
  http://localhost:3000/auth
  https://auth.expo.io/@tu-usuario/linguapp
  ```

#### Para iOS:
- Application type: **iOS**
- Name: `LinguApp iOS`
- Bundle ID: `app.rork.linguapp`

#### Para Android:
- Application type: **Android**
- Name: `LinguApp Android`
- Package name: `app.rork.linguapp`
- SHA-1 certificate fingerprint: `[Generar con el comando abajo]`

### Paso 3: Obtener SHA-1 para Android

Ejecuta este comando en la terminal para obtener el SHA-1:

```bash
# En Windows (PowerShell)
keytool -list -v -keystore android/app/debug.keystore -alias androiddebugkey -storepass android -keypass android

# En macOS/Linux
keytool -list -v -keystore android/app/debug.keystore -alias androiddebugkey -storepass android -keypass android
```

### Paso 4: Actualizar .env

Reemplaza en tu archivo `.env`:
```
EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID=tu_google_web_client_id_aqui
EXPO_PUBLIC_GOOGLE_IOS_CLIENT_ID=tu_google_ios_client_id_aqui
EXPO_PUBLIC_GOOGLE_ANDROID_CLIENT_ID=tu_google_android_client_id_aqui
```

## 🐙 GitHub OAuth Setup

### Paso 1: Crear GitHub OAuth App

1. Ve a [GitHub Settings > Developer settings > OAuth Apps](https://github.com/settings/developers)
2. Haz clic en **"New OAuth App"**
3. Completa los campos:
   ```
   Application name: LinguApp
   Homepage URL: http://localhost:3000
   Application description: LinguApp - Language Learning App
   Authorization callback URL: http://localhost:3000/auth
   ```

### Paso 2: Actualizar .env

Reemplaza en tu archivo `.env`:
```
EXPO_PUBLIC_GITHUB_CLIENT_ID=tu_github_client_id_aqui
EXPO_PUBLIC_GITHUB_CLIENT_SECRET=tu_github_client_secret_aqui
```

## 🍎 Apple Sign-In Setup

### Paso 1: Configurar Apple Developer Account

1. Ve a [Apple Developer Portal](https://developer.apple.com/)
2. Ve a **"Certificates, Identifiers & Profiles"**
3. Edita tu App ID (`app.rork.linguapp`)
4. Habilita **"Sign In with Apple"** capability

### Paso 2: Configurar en Expo

Apple Sign-In ya está configurado en tu `app.json` con el plugin `expo-apple-authentication`. No necesitas variables de entorno adicionales.

## 🚀 Probar la Configuración

### Paso 1: Reiniciar el Servidor

Después de actualizar el archivo `.env`, reinicia el servidor:

```bash
# Detener el servidor actual (Ctrl+C)
# Luego reiniciar
npx expo start --web --port 3000 --clear
```

### Paso 2: Probar OAuth

1. Abre http://localhost:3000
2. Ve a la pantalla de Sign In
3. Haz clic en los botones de Google, GitHub o Apple
4. Deberías ver el flujo OAuth real en lugar de los datos mock

## 🔧 Solución de Problemas

### Error: "Client ID not configured"
- Verifica que las variables de entorno estén correctamente configuradas en `.env`
- Asegúrate de reiniciar el servidor después de cambiar `.env`

### Error: "Redirect URI mismatch"
- Verifica que las URLs de redirección en Google Cloud Console coincidan exactamente
- Para desarrollo local: `http://localhost:3000/auth`

### Error: "Apple Sign-In not available"
- Apple Sign-In solo funciona en dispositivos iOS reales o simuladores iOS
- En web, se mostrará un mensaje de que no está disponible

### Error: "GitHub OAuth failed"
- Verifica que el Client ID y Client Secret sean correctos
- Asegúrate de que la callback URL sea exactamente `http://localhost:3000/auth`

## 📝 Notas Importantes

1. **Nunca commites el archivo `.env`** a control de versiones
2. **Usa credenciales diferentes** para desarrollo y producción
3. **Las URLs de redirección deben coincidir exactamente** (incluyendo http vs https)
4. **Reinicia el servidor** después de cambiar variables de entorno

## 🎯 Resultado Esperado

Después de completar esta configuración:
- ✅ Google Sign-In abrirá la página de Google OAuth real
- ✅ GitHub Sign-In abrirá la página de GitHub OAuth real  
- ✅ Apple Sign-In funcionará en dispositivos iOS reales
- ✅ Ya no verás "Hello, Development User! 👋" automáticamente

¡Tu aplicación ahora usará OAuth real en lugar de datos mock!
