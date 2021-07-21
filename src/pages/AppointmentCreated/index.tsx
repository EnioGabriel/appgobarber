import { useNavigation } from '@react-navigation/native';
import React, { useCallback } from 'react';
import Icon from 'react-native-vector-icons/Feather';
import {
  Container,
  Title,
  Description,
  OkButton,
  OkButtonText,
} from './styles';

const AppointmentCreated: React.FC = () => {
  // reset impede que o usuário clique em voltar e acesse as telas anteriores
  const { reset } = useNavigation();

  const handleOkPressed = useCallback(() => {
    reset({
      // Estado da rota (tela) que quero resetar o usuário
      routes: [
        {
          name: 'Dashboard',
        },
      ],
      // Posição para setar a rota (tela) indicada, como tem só uma, usa o zero
      index: 0,
    });
  }, [reset]);

  return (
    <Container>
      <Icon name="check" size={80} color="#04d361" />

      <Title>Agendamento concluído</Title>
      <Description>Hora do agendamento</Description>

      <OkButton onPress={handleOkPressed}>
        <OkButtonText>Ok</OkButtonText>
      </OkButton>
    </Container>
  );
};

export default AppointmentCreated;
