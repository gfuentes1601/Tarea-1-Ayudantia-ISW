import { handleSuccess } from "../Handlers/responseHandlers.js";
import { AppDataSource } from "../config/configDB.js";
import { User } from "../entities/user.entity.js";
import bcrypt from "bcrypt";

export function getPublicProfile(req, res) {
  handleSuccess(res, 200, "Perfil público obtenido exitosamente", {
    message: "¡Hola! Este es un perfil público. Cualquiera puede verlo.",
  });
}

export function getPrivateProfile(req, res) {
  const user = req.user;

  handleSuccess(res, 200, "Perfil privado obtenido exitosamente", {
    message: `¡Hola, ${user.email}! Este es tu perfil privado. Solo tú puedes verlo.`,
    userData: user,
  });
}

export async function updatePrivateProfile(req, res) {
  const userRepository = AppDataSource.getRepository(User);
  const userFromToken = req.user;

  const { email, password } = req.body;

  if (!email && !password) {
    return handleError(res, 400, "Debes proporcionar un nuevo email y/o password.");
  }

  try {
    const user = await userRepository.findOneBy({ id: userFromToken.id });

    if (!user) {
      return handleError(res, 404, "Usuario no encontrado.");
    }

    if (email) user.email = email;
    if (password) user.password = await bcrypt.hash(password, 10);

    await userRepository.save(user);

    return handleSuccess(res, 200, "Perfil actualizado exitosamente.", {
      email: user.email,
    });
  } catch (error) {
    console.error(error);
    return handleError(res, 500, "Error al actualizar el perfil.");
  }
}

export async function deletePrivateProfile(req, res) {
  const userRepository = AppDataSource.getRepository(User);
  const userFromToken = req.user;

  try {
    const user = await userRepository.findOneBy({ id: userFromToken.id });

    if (!user) {
      return handleError(res, 404, "Usuario no encontrado.");
    }

    await userRepository.remove(user);

    return handleSuccess(res, 200, "Tu cuenta ha sido eliminada exitosamente.");
  } catch (error) {
    console.error(error);
    return handleError(res, 500, "Error al eliminar el perfil.");
  }
}
