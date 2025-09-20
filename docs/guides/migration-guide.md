# MIGRATION GUIDE - UNIFIED ARCHITECTURE

## 🚀 GUÍA DE MIGRACIÓN PASO A PASO

Esta guía te ayudará a migrar componentes del sistema legacy a la nueva arquitectura unificada.

## 📋 CHECKLIST DE MIGRACIÓN

### Antes de Empezar
- [ ] Entender la nueva arquitectura (leer `unified-architecture.md`)
- [ ] Identificar componentes a migrar
- [ ] Hacer backup del código actual
- [ ] Crear rama de feature para la migración

### Durante la Migración
- [ ] Actualizar imports
- [ ] Reemplazar hooks legacy
- [ ] Actualizar llamadas a servicios
- [ ] Verificar tipos TypeScript
- [ ] Testear funcionalidad

### Después de la Migración
- [ ] Ejecutar tests
- [ ] Verificar performance
- [ ] Documentar cambios
- [ ] Code review

## 🔄 PASOS DE MIGRACIÓN

### Paso 1: Actualizar Imports

**ANTES:**
```typescript
// ❌ Imports legacy
import { useAuth } from '@/hooks/useAuth';
import { useGameState } from '@/hooks/useGameState';
import { databaseService } from '@/services/database';
import { firestoreService } from '@/services/firestoreService';
```

**DESPUÉS:**
```typescript
// ✅ Imports unificados
import { useAuth, useGamification } from '@/store/unifiedStore';
import { unifiedService } from '@/services/unifiedService';
```

### Paso 2: Reemplazar Hooks

**ANTES:**
```typescript
// ❌ Hooks legacy
const { user, signIn, signOut } = useAuth();
const { points, addPoints } = useGameState();
```

**DESPUÉS:**
```typescript
// ✅ Hooks unificados
const { user, signIn, signOut } = useAuth();
const { points, addPoints } = useGamification();
```

### Paso 3: Actualizar Llamadas a Servicios

**ANTES:**
```typescript
// ❌ Servicios legacy
await databaseService.saveUser(user);
await firestoreService.updateUser(userId, updates);
```

**DESPUÉS:**
```typescript
// ✅ Servicio unificado
await unifiedService.saveUser(user);
await unifiedService.updateUser(userId, updates);
```

## 📝 EJEMPLOS DE MIGRACIÓN

### Ejemplo 1: Componente de Autenticación

**ANTES:**
```typescript
import React, { useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { databaseService } from '@/services/database';

export default function SignInScreen() {
  const { user, signIn, isLoading, error } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleSignIn = async () => {
    try {
      await signIn(email, password);
      await databaseService.saveUser(user);
    } catch (error) {
      console.error('Sign in failed:', error);
    }
  };

  return (
    <View>
      <Input value={email} onChangeText={setEmail} />
      <Input value={password} onChangeText={setPassword} />
      <Button onPress={handleSignIn} disabled={isLoading} />
      {error && <Text>{error}</Text>}
    </View>
  );
}
```

**DESPUÉS:**
```typescript
import React, { useState } from 'react';
import { useAuth } from '@/store/unifiedStore';
import { unifiedService } from '@/services/unifiedService';

export default function SignInScreen() {
  const { user, signIn, isLoading, error } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleSignIn = async () => {
    try {
      await signIn(email, password);
      // El servicio unificado maneja automáticamente el guardado
    } catch (error) {
      console.error('Sign in failed:', error);
    }
  };

  return (
    <View>
      <Input value={email} onChangeText={setEmail} />
      <Input value={password} onChangeText={setPassword} />
      <Button onPress={handleSignIn} disabled={isLoading} />
      {error && <Text>{error}</Text>}
    </View>
  );
}
```

### Ejemplo 2: Componente de Gamificación

**ANTES:**
```typescript
import React from 'react';
import { useGameState } from '@/hooks/useGameState';
import { firestoreService } from '@/services/firestoreService';

export default function GameScreen() {
  const { points, addPoints, hearts, useHearts } = useGameState();

  const handleCorrectAnswer = async () => {
    try {
      await addPoints(10);
      await firestoreService.updateUser(userId, { points: points + 10 });
    } catch (error) {
      console.error('Failed to add points:', error);
    }
  };

  const handleWrongAnswer = async () => {
    try {
      const canContinue = await useHearts(1);
      if (!canContinue) {
        // Game over logic
      }
    } catch (error) {
      console.error('Failed to use hearts:', error);
    }
  };

  return (
    <View>
      <Text>Points: {points}</Text>
      <Text>Hearts: {hearts}</Text>
      <Button onPress={handleCorrectAnswer} title="Correct" />
      <Button onPress={handleWrongAnswer} title="Wrong" />
    </View>
  );
}
```

**DESPUÉS:**
```typescript
import React from 'react';
import { useGamification } from '@/store/unifiedStore';

export default function GameScreen() {
  const { points, addPoints, hearts, useHearts } = useGamification();

  const handleCorrectAnswer = async () => {
    try {
      await addPoints(10);
      // El servicio unificado maneja automáticamente la sincronización
    } catch (error) {
      console.error('Failed to add points:', error);
    }
  };

  const handleWrongAnswer = async () => {
    try {
      const canContinue = await useHearts(1);
      if (!canContinue) {
        // Game over logic
      }
    } catch (error) {
      console.error('Failed to use hearts:', error);
    }
  };

  return (
    <View>
      <Text>Points: {points}</Text>
      <Text>Hearts: {hearts}</Text>
      <Button onPress={handleCorrectAnswer} title="Correct" />
      <Button onPress={handleWrongAnswer} title="Wrong" />
    </View>
  );
}
```

### Ejemplo 3: Componente de Perfil

**ANTES:**
```typescript
import React from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useLanguage } from '@/hooks/useLanguage';
import { databaseService } from '@/services/database';

export default function ProfileScreen() {
  const { user, updateUser } = useAuth();
  const { currentLanguage, setLanguage } = useLanguage();

  const handleLanguageChange = async (language) => {
    try {
      setLanguage(language);
      await updateUser({ currentLanguage: language });
      await databaseService.saveUser({ ...user, currentLanguage: language });
    } catch (error) {
      console.error('Failed to update language:', error);
    }
  };

  return (
    <View>
      <Text>Name: {user?.name}</Text>
      <Text>Language: {currentLanguage?.name}</Text>
      <Button onPress={() => handleLanguageChange(newLanguage)} />
    </View>
  );
}
```

**DESPUÉS:**
```typescript
import React from 'react';
import { useAuth, useLanguage } from '@/store/unifiedStore';

export default function ProfileScreen() {
  const { user, updateUser } = useAuth();
  const { targetLanguage, setTargetLanguage } = useLanguage();

  const handleLanguageChange = async (language) => {
    try {
      setTargetLanguage(language);
      await updateUser({ currentLanguage: language });
      // El servicio unificado maneja automáticamente el guardado
    } catch (error) {
      console.error('Failed to update language:', error);
    }
  };

  return (
    <View>
      <Text>Name: {user?.name}</Text>
      <Text>Language: {targetLanguage?.name}</Text>
      <Button onPress={() => handleLanguageChange(newLanguage)} />
    </View>
  );
}
```

## 🔧 CONFIGURACIÓN ADICIONAL

### 1. Configurar TypeScript

Asegúrate de que tu `tsconfig.json` incluya los nuevos paths:

```json
{
  "compilerOptions": {
    "paths": {
      "@/*": ["./*"],
      "@/store/*": ["./store/*"],
      "@/services/*": ["./services/*"]
    }
  }
}
```

### 2. Configurar ESLint

Actualiza las reglas de ESLint para el nuevo patrón:

```json
{
  "rules": {
    "no-restricted-imports": [
      "error",
      {
        "patterns": [
          {
            "group": ["@/hooks/useAuth", "@/hooks/useGameState"],
            "message": "Use @/store/unifiedStore instead"
          }
        ]
      }
    ]
  }
}
```

### 3. Configurar Jest

Actualiza la configuración de Jest para los nuevos imports:

```javascript
// jest.config.js
module.exports = {
  moduleNameMapping: {
    '^@/(.*)$': '<rootDir>/$1',
    '^@/store/(.*)$': '<rootDir>/store/$1',
    '^@/services/(.*)$': '<rootDir>/services/$1'
  }
};
```

## 🧪 TESTING DE MIGRACIÓN

### 1. Tests Unitarios

**ANTES:**
```typescript
import { renderHook } from '@testing-library/react-hooks';
import { useAuth } from '@/hooks/useAuth';

test('should handle authentication', () => {
  const { result } = renderHook(() => useAuth());
  expect(result.current.user).toBeNull();
});
```

**DESPUÉS:**
```typescript
import { renderHook } from '@testing-library/react-hooks';
import { useAuth } from '@/store/unifiedStore';

test('should handle authentication', () => {
  const { result } = renderHook(() => useAuth());
  expect(result.current.user).toBeNull();
});
```

### 2. Tests de Integración

```typescript
import { unifiedService } from '@/services/unifiedService';

test('should handle offline mode', async () => {
  // Mock offline
  jest.spyOn(unifiedService, 'isOnline').mockReturnValue(false);
  
  await unifiedService.saveUser(mockUser);
  
  // Should save to local storage
  expect(localStorage.getItem('local_user')).toBeTruthy();
});
```

## 🚨 PROBLEMAS COMUNES Y SOLUCIONES

### 1. Error: "Cannot find module '@/store/unifiedStore'"

**Solución:**
```bash
# Verificar que el archivo existe
ls store/unifiedStore.ts

# Verificar tsconfig.json paths
cat tsconfig.json | grep paths
```

### 2. Error: "Property does not exist on type"

**Solución:**
```typescript
// Verificar imports de tipos
import { User, Language, CEFRLevel } from '@/types';

// Usar type assertion si es necesario
const learningGoals = onboardingData.learningGoals as LearningGoal[];
```

### 3. Error: "Function is not a function"

**Solución:**
```typescript
// Verificar que estás usando el hook correcto
const { addPoints } = useGamification(); // ✅ Correcto
const { addPoints } = useAuth(); // ❌ Incorrecto
```

### 4. Error: "Cannot read property of undefined"

**Solución:**
```typescript
// Agregar null checks
const { user } = useAuth();
if (!user) return null;

// O usar optional chaining
<Text>{user?.name}</Text>
```

## 📊 VERIFICACIÓN DE MIGRACIÓN

### Checklist de Verificación

- [ ] **Imports actualizados**: No hay imports legacy
- [ ] **Hooks unificados**: Uso de hooks del unifiedStore
- [ ] **Servicios unificados**: Uso de unifiedService
- [ ] **Tipos correctos**: TypeScript sin errores
- [ ] **Funcionalidad**: App funciona correctamente
- [ ] **Performance**: No hay regresiones
- [ ] **Tests pasando**: Todos los tests funcionan

### Comandos de Verificación

```bash
# Verificar TypeScript
npm run type-check

# Verificar linting
npm run lint

# Ejecutar tests
npm run test

# Verificar build
npm run build
```

## 🎯 PRÓXIMOS PASOS

### Después de la Migración

1. **Documentar cambios**: Actualizar README y documentación
2. **Code review**: Revisar cambios con el equipo
3. **Testing**: Ejecutar tests de integración
4. **Deploy**: Hacer deploy a staging
5. **Monitor**: Monitorear performance y errores

### Limpieza Legacy

Una vez que todos los componentes estén migrados:

1. **Deprecar hooks legacy**: Marcar como deprecated
2. **Deprecar servicios legacy**: Marcar como deprecated
3. **Remover código no usado**: Eliminar imports no utilizados
4. **Actualizar documentación**: Remover referencias legacy

## 📞 SOPORTE

Si encuentras problemas durante la migración:

1. **Revisar documentación**: `docs/unified-architecture.md`
2. **Verificar ejemplos**: Este documento
3. **Consultar equipo**: Code review
4. **Crear issue**: Si es un bug

---

**¡Feliz migración! 🚀**
