import { createGlobalStyle } from 'styled-components';
import breakpoints from './breakpoints';

export const theme = {
  breakpoints,
  // You can add more theme variables here
};

export const GlobalStyles = createGlobalStyle`
    body {
        font-family: Arial, sans-serif;
        margin: 0;
    

    .tp-chat-container {
        padding: 20px;
        padding-bottom: 0px;
        padding-right: 0px;
    }

    .container {
        max-width: 200px;
        margin: 0 auto;
        background: white;
        padding: 20px;
        border-radius: 8px;
        box-shadow: 0 2px 4px rgba(0,0,0,0.1);   
    }

    .header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-bottom: 20px;
        padding-bottom: 20px;
        border-bottom: 1px solid #ddd;
    }

    

    /* Example usage of breakpoints in styled-components */
    @media (max-width: ${breakpoints.sm}px) {
      .container {
        max-width: 100vw;
      }
    }
`;