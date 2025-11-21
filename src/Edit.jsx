import React, { useEffect, useState } from "react";
import {
	Box,
	TextField,
	FormControlLabel,
	Switch,
	FormControl,
	InputLabel,
	Select,
	MenuItem,
	Button,
	Stack
} from "@mui/material";

export default function Edit({
	server = {
		name: "",
		address: ""
	},
	onSubmit,
	onCancel
}) {
	const [form, setForm] = useState(server);

	const handleChange = (field) => (event) => {
		const value = field === "ssl" ? event.target.checked : event.target.value;
		setForm((prev) => ({ ...prev, [field]: value }));
	};

	const handleSubmit = (e) => {
		e.preventDefault();
		if (onSubmit) onSubmit(form);
	};

	useEffect(() => {
		const newServer = { ...server };
		const creds = window.appAPI.getCredentials(newServer.address).then((creds) => {
			if (creds) {
				newServer.username = creds.account.split("@")[0];
				newServer.authType = creds.account.split("@")[1] || "pam";
			}

			console.log(newServer);
			setForm(newServer);
		});
	}, [server]);

	return (
		<Box component="form" onSubmit={handleSubmit} sx={{ p: 2 }}>
			<Stack spacing={2}>
				<TextField
					label="Nazwa"
					value={form.name? form.name : ""}
					onChange={handleChange("name")}
					fullWidth
					required
				/>

				<TextField
					label="Adres (host lub URL)"
					value={form.address? form.address : ""}
					onChange={handleChange("address")}
					fullWidth
					required
				/>

				<TextField
					label="Login"
					value={form.username? form.username : ""}
					onChange={handleChange("username")}
					fullWidth
					required
				/>

				<TextField
					label="Hasło"
					type="password"
					value={form.password? form.password : ""}
					onChange={handleChange("password")}
					fullWidth
				/>

				<FormControlLabel
					control={
						<Switch
							checked={form.ssl? true : false}
							onChange={handleChange("ssl")}
						/>
					}
					label="Użyj SSL"
				/>

				<FormControl fullWidth>
					<InputLabel id="auth-type-label">Rodzaj autoryzacji</InputLabel>
					<Select
						labelId="auth-type-label"
						label="Rodzaj autoryzacji"
						value={form.authType?   form.authType : "pam"}
						onChange={handleChange("authType")}
					>
						<MenuItem value="pam">PAM</MenuItem>
						<MenuItem value="ad">Active Directory</MenuItem>
					</Select>
				</FormControl>

				<Stack direction="row" spacing={2} justifyContent="flex-end">
					{onCancel && (
						<Button type="button" variant="outlined" color="inherit" onClick={onCancel}>
							Anuluj
						</Button>
					)}
					<Button type="submit" variant="contained" color="primary">
						Zapisz
					</Button>
				</Stack>
			</Stack>
		</Box>
	);
}
