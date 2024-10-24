import Modal from 'react-modal';
import { FiX } from 'react-icons/fi';
import { toast } from 'react-toastify';
import { setupAPIClient } from '@/services/api';

interface DeleteProps {
    isOpen: boolean;
    onRequestClose: () => void;
    delete_user: string;
    onUserDeleted: (userId: string) => void;
}

export function ModalDeleteUser({ isOpen, onRequestClose, delete_user, onUserDeleted }: DeleteProps) {

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

    async function handleDeleteUser() {
        try {
            const apiClient = setupAPIClient();

            await apiClient.delete(`/user/delete_user?user_id=${delete_user}`);

            toast.success(`Usuário deletado com sucesso.`);
            onUserDeleted(delete_user);
            onRequestClose();

        } catch (error) {
            if (error instanceof Error && 'response' in error && error.response) {
                console.log((error as any).response.data);
                toast.error('Ops erro ao deletar o usuario.');
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
                <h1 className='text-xl mt-5'>Deseja mesmo deletar esse usuário?</h1>
                <button
                    className="mt-10 w-full md:w-80 px-6 py-3 bg-red-600 text-white rounded hover:bg-hoverButtonBackground transition duration-300"
                    onClick={handleDeleteUser}
                >
                    Deletar
                </button>
            </div>
        </Modal>
    )
}