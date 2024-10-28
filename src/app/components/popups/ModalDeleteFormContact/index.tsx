import Modal from 'react-modal';
import { FiX } from 'react-icons/fi';
import { toast } from 'react-toastify';
import { setupAPIClient } from '@/services/api';

interface DeleteProps {
    isOpen: boolean;
    onRequestClose: () => void;
    form_contact_ids: any;
    refresh_list: any;
    new_list: any
}

export function ModalDeleteFormContact({ isOpen, onRequestClose, form_contact_ids, refresh_list, new_list }: DeleteProps) {

    const customStyles = {
        content: {
            top: '50%',
            bottom: 'auto',
            left: '50%',
            right: 'auto',
            padding: '30px',
            transform: 'translate(-50%, -50%)',
            backgroundColor: 'black',
            zIndex: 9999999
        }
    };

    async function handleContactForm() {
        try {
            const apiClient = setupAPIClient();
            await apiClient.delete(`/form_contact/delete_form_contatct`, {
                data: {
                    form_contact_ids: form_contact_ids
                }
            });
    
            toast.success(`Usuário deletado com sucesso.`);
            refresh_list();
            new_list();
            onRequestClose();
    
        } catch (error) {
            if (error instanceof Error && 'response' in error && error.response) {
                console.log((error as any).response.data);
                toast.error('Ops, erro ao deletar o usuário.');
            } else {
                console.error(error);
                toast.error('Erro desconhecido.');
            }
        }
    }    


    return (
        <Modal
            isOpen={isOpen}
            onRequestClose={onRequestClose}
            style={customStyles}
        >
            <button
                type='button'
                onClick={onRequestClose}
                className='react-modal-close'
                style={{ background: 'transparent', border: 0, cursor: 'pointer' }}
            >
                <FiX size={45} color="#f34748" />
            </button>

            <div className='text-center'>
                <h1 className='text-xl mt-5'>Deseja mesmo deletar esses contato(s)?</h1>
                <button
                    className="mt-10 w-full md:w-80 px-6 py-3 bg-red-600 text-white rounded hover:bg-hoverButtonBackground transition duration-300"
                    onClick={handleContactForm}
                >
                    Deletar
                </button>
            </div>
        </Modal>
    )
}