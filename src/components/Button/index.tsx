import React from 'react';
import { RectButtonProperties } from 'react-native-gesture-handler';

import { Container, ButtonText } from './styles';

interface ButtonProps extends RectButtonProperties {
  children: string; // conteúdo do botão
}

// ...rest: pega todas as propriedades que um botão pode acessar
const Button: React.FC<ButtonProps> = ({ children, ...rest }) => (
  // Pegando todas as propriedades e passando pro container, exceto o children
  <Container {...rest}>
    <ButtonText>{children}</ButtonText>
  </Container>
);

export default Button;
