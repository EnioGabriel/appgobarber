import React, { useCallback, useRef } from 'react';
import {
  View,
  KeyboardAvoidingView,
  ScrollView,
  Platform,
  TextInput,
  Alert,
} from 'react-native';
import Icon from 'react-native-vector-icons/Feather';
import { launchImageLibrary } from 'react-native-image-picker';
import { useNavigation } from '@react-navigation/native';
import { Form } from '@unform/mobile';
import { FormHandles } from '@unform/core';
import * as Yup from 'yup';

import api from '../../services/api';

import getValidationErrors from '../../utils/getValidatorErrors';

import Input from '../../components/Input';
import Button from '../../components/Button';

import {
  Container,
  Title,
  UserAvatarButton,
  UserAvatar,
  BackButton,
} from './styles';
import { useAuth } from '../../hooks/auth';

interface ProfileFormData {
  name: string;
  email: string;
  old_password: string;
  password: string;
  password_confirmation: string;
}

const Profile: React.FC = () => {
  const { user, updateUser } = useAuth();

  const formRef = useRef<FormHandles>(null);
  const navigation = useNavigation();

  const emailInputRef = useRef<TextInput>(null);
  const oldPasswordInputRef = useRef<TextInput>(null);
  const passwordInputRef = useRef<TextInput>(null);
  const confirmPasswordInputRef = useRef<TextInput>(null);

  const handleProfile = useCallback(
    async (data: ProfileFormData) => {
      try {
        formRef.current?.setErrors({}); // sempre zerando a validação de erro

        const schema = Yup.object().shape({
          name: Yup.string().required('Nome obrigatório!'),
          email: Yup.string()
            .required('E-mail obrigatório!')
            .email('Digite um e-mail válido!'),
          old_password: Yup.string(),
          password: Yup.string().when('old_password', {
            is: (val: string) => !!val.length,
            then: Yup.string().required('Campo obrigatório!'),
            otherwise: Yup.string(),
          }),
          password_confirmation: Yup.string()
            .when('old_password', {
              is: (val: string) => !!val.length,
              then: Yup.string().required('Campo obrigatório!'),
              otherwise: Yup.string(),
            })
            .oneOf([Yup.ref('password'), null], 'Senhas estão diferente'),
        });

        await schema.validate(data, {
          abortEarly: false, // retorna todos os erros de uma vez só
        });

        // Desestruturando objeto
        const { name, email, password, old_password, password_confirmation } =
          data;

        // Object.assign une 2 objetos
        // unindo
        const formData = Object.assign(
          {
            // 1° obj
            name,
            email,
          },
          old_password
            ? // Se o usuário preencheu os campos de senha
              // Usado para alteração de password
              {
                // 2° obj
                old_password,
                password,
                password_confirmation,
              }
            : // Se não preencheu, não manda nada
              // Usado para alterações de nome e email
              {}, // ou 2° obj
        );

        // enviando as informações para o backend
        const response = await api.put('/profile', formData);

        updateUser(response.data);

        Alert.alert('Perfil atualizado com sucesso!');

        navigation.goBack();
      } catch (err) {
        if (err instanceof Yup.ValidationError) {
          const errors = getValidationErrors(err);

          formRef.current?.setErrors(errors);

          console.log(errors);

          return;
        }

        Alert.alert(
          'Erro na atualização do perfil',
          'Ocorreu um erro ao atualizar seu perfil, tente novamente.',
        );
      }
    },
    [navigation, updateUser],
  );

  const handleUpdateAvatar = useCallback(() => {
    launchImageLibrary({ mediaType: 'photo' }, async (response) => {
      if (response.didCancel) {
        return;
      }

      if (response.errorCode === 'camera_unavailable') {
        Alert.alert('Camera não disponível');
        return;
      }

      if (response.errorCode === 'permission') {
        Alert.alert('Permissão negada', 'Você precisa liberar permissão');
        return;
      }

      if (response.errorMessage) {
        Alert.alert('Erro ao atualizar seu avatar');
        return;
      }

      const data = new FormData();

      data.append('avatar', {
        type: 'image/jpeg',
        name: `${user.id}.jpg`,
        // @ts-ignore: Object is possibly 'null'.
        uri: response.assets[0].uri,
      });

      api.patch('/users/avatar', data).then((apiResponse) => {
        updateUser(apiResponse.data);
      });
    });
  }, [updateUser, user.id]);

  const handleGoBack = useCallback(() => {
    navigation.goBack();
  }, [navigation]);

  return (
    <>
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        enabled
      >
        <ScrollView
          keyboardShouldPersistTaps="handled"
          contentContainerStyle={{ flex: 0 }}
        >
          <Container>
            <BackButton onPress={handleGoBack}>
              <Icon name="chevron-left" size={24} color="#999591" />
            </BackButton>

            <UserAvatarButton onPress={handleUpdateAvatar}>
              <UserAvatar source={{ uri: user.avatar_url }}></UserAvatar>
            </UserAvatarButton>
            {/* corrigindo bug de animação qnd abre o teclado */}
            <View>
              <Title>Meu perfil</Title>
            </View>

            <Form
              initialData={{ name: user.name, email: user.email }}
              ref={formRef}
              onSubmit={handleProfile}
            >
              <Input
                autoCapitalize="words" // Caixa alta apenas na primeira letra de cada palavra
                name="name"
                icon="user"
                placeholder="Nome"
                returnKeyType="next"
                onSubmitEditing={() => {
                  emailInputRef.current?.focus();
                }}
              />

              <Input
                ref={emailInputRef}
                keyboardType="email-address"
                autoCorrect={false}
                autoCapitalize="none"
                name="email"
                icon="mail"
                placeholder="E-mail"
                returnKeyType="next"
                onSubmitEditing={() => {
                  oldPasswordInputRef.current?.focus();
                }}
              />

              <Input
                ref={oldPasswordInputRef}
                secureTextEntry
                name="old_password"
                icon="lock"
                placeholder="Senha atual"
                textContentType="newPassword" // não deixa gerar uma senha automatica (iOS)
                returnKeyType="next"
                containerStyle={{ marginTop: 16 }}
                onSubmitEditing={() => {
                  passwordInputRef.current?.focus();
                }}
              />

              <Input
                ref={passwordInputRef}
                secureTextEntry
                name="password"
                icon="lock"
                placeholder="Nova senha"
                textContentType="newPassword" // não deixa gerar uma senha automatica (iOS)
                returnKeyType="next"
                onSubmitEditing={() => {
                  confirmPasswordInputRef.current?.focus();
                }}
              />

              <Input
                ref={confirmPasswordInputRef}
                secureTextEntry
                name="password_confirmation"
                icon="lock"
                placeholder="Confirmar senha"
                textContentType="newPassword" // não deixa gerar uma senha automatica (iOS)
                returnKeyType="send"
                onSubmitEditing={() => {
                  formRef.current?.submitForm();
                }}
              />
            </Form>

            <Button
              onPress={() => {
                formRef.current?.submitForm();
              }}
            >
              Confirmar mudanças
            </Button>
          </Container>
        </ScrollView>
      </KeyboardAvoidingView>
    </>
  );
};

export default Profile;
