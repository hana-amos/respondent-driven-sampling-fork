import { useEffect, useRef, useState } from 'react';

//import { Html5QrcodeScanner } from 'html5-qrcode'; // Import QR scanner
import { Html5Qrcode } from 'html5-qrcode'; // Use Html5Qrcode class instead
import { useNavigate } from 'react-router-dom';

import Header from '@/pages/Header/Header';

import '@/styles/ApplyReferral.css';

import { LogoutProps } from '@/types/AuthProps';

console.log("Deployed changes to Azure.");

export default function ApplyReferral({ onLogout }: LogoutProps) {
	const navigate = useNavigate();
	const [referralCode, setReferralCode] = useState('');
	const [loading, setLoading] = useState(false);
	const [isScanning, setIsScanning] = useState(false); // Track scanning state
	//const scannerRef = useRef<Html5QrcodeScanner | null>(null); <-- original useRef
	const scannerRef = useRef<Html5Qrcode | null>(null); // replaced above line to use right class
	const readerRef = useRef<HTMLDivElement | null>(null);

	// Effect to initialize the QR scanner
	// This effect runs when the component mounts and when isScanning changes
	/* Original useEffect code:
	useEffect(() => {
		if (isScanning && readerRef.current) {
			const config = { fps: 10, qrbox: 250 };
			const verbose = false;
			scannerRef.current = new Html5QrcodeScanner(
				'qr-reader',
				config,
				verbose
			);

			scannerRef.current.render(onScanSuccess, onScanFailure);
		}

		// Cleanup function to stop the scanner when the component unmounts or scanning stops
		return () => {
			if (scannerRef.current) {
				scannerRef.current
					.clear()
					.catch(err =>
						console.warn('Failed to clear QR scanner:', err)
					);
			}
		};
	}, [isScanning]);
	*/

	// New effect 7/31: ====================================================================
	useEffect(() => {
		if (isScanning && readerRef.current) {
			const html5QrCode = new Html5Qrcode('qr-reader');
			scannerRef.current = html5QrCode;

			const config = {
				fps: 10,
				videoConstraints: {
					facingMode: { ideal: "environment" }, // or just "environment"
					width: { ideal: 1280 },
					height: { ideal: 720 }  
				}
			};

			html5QrCode.start(
				{},      // cameraIdOrConfig is empty object: tells html5-qrcode to use constraints
				config,
				onScanSuccess,
				onScanFailure
			)
				.catch((err) => {
					console.error("Failed to start scanning:", err);
					alert("Could not access the camera. Please ensure permissions are granted.");
					setIsScanning(false);
				});
		}

		return () => {
			if (scannerRef.current) {
				if (scannerRef.current.isScanning) {
					scannerRef.current
						.stop()
						.then(() => scannerRef.current?.clear())
						.catch(err =>
							console.warn('Failed to stop/clear QR scanner:', err)
						);
				} else {
					try {
						scannerRef.current.clear();
					} catch (err) {
						console.warn('Failed to clear QR scanner:', err);
					}
				}
			}
		};
	}, [isScanning]);


	// New effect to initialize QR scanner before 7/31:
	/*
	useEffect(() => {
		if (isScanning && readerRef.current) {
			const html5QrCode = new Html5Qrcode('qr-reader') as any;
			scannerRef.current = html5QrCode;

			const supportedConstraints = navigator.mediaDevices.getSupportedConstraints();

			if (supportedConstraints.facingMode) {
				console.log("'facingMode' is supported on this browser/device.");
			} else {
				console.warn("'facingMode' is NOT supported on this browser/device.");
			}

			const constraints: MediaStreamConstraints = {
				video: {
					facingMode: { exact: "environment" },
				}
			};

			navigator.mediaDevices.getUserMedia(constraints)
				.then((stream) => {
					return html5QrCode.startFromCameraStream( // does not exist??
						stream,
						{
							fps: 10,
							qrbox: 250,
						},
						onScanSuccess,
						onScanFailure
					);
				})
				.catch((err) => {
					console.error("Camera access failed or back camera not available:", err);
					alert("Could not access the back camera. Please ensure permissions are granted.");
					setIsScanning(false);
				});
		}

		/*
		const constraints = {
			facingMode: { exact: "environment" },
			width: { ideal: 4096 },
			height: { ideal: 2160 }
		};

		const config = {
			fps: 10,
			qrbox: 250,
		};
		

		html5QrCode.start(
			constraints,
			//{ facingMode: { exact: "environment" } },
			config,
			onScanSuccess,
			onScanFailure
		)
			.catch(err => {
				console.error('Error starting QR scanner:', err);
			});
	}

		// Cleanup
		return () => {
			if (scannerRef.current) {
				if (scannerRef.current.isScanning) {
					scannerRef.current
						.stop()
						.then(() => scannerRef.current?.clear())
						.catch(err =>
							console.warn('Failed to stop/clear QR scanner:', err)
						);
				} else {
					// safe fallback, trying to clear without stopping
					try {
						scannerRef.current.clear();
					} catch (err) {
						console.warn('Failed to clear QR scanner:', err);
					}
				}
			}
		};
	}, [isScanning]);
	*/

	// Function to handle logout
	/* Original onScanSuccess function:
	const onScanSuccess = (decodedText: string) => {
		if (scannerRef.current) {
			scannerRef.current
				.clear()
				.then(() =>
					console.log('Scanner stopped after successful scan')
				)
				.catch(error =>
					console.error('Failed to stop scanner:', error)
				);
		}
		setIsScanning(false);

		// Check if the scanned text is a valid URL
		try {
			const url = new URL(decodedText);
			window.location.href = url.href; // Redirect user to the scanned URL
		} catch (error) {
			alert('Invalid QR Code. Please scan a valid link.');
		}
	};
	*/

	// my new onScanSuccess (7/29):
	const onScanSuccess = (decodedText: string) => {
		if (scannerRef.current) {
			scannerRef.current
				.stop()
				.then(() => {
					try {
						scannerRef.current?.clear();
						console.log('Scanner stopped and cleared after successful scan');
					} catch (clearError) {
						console.warn('Failed to clear QR scanner:', clearError);
					}
				})
				.catch(error =>
					console.error('Failed to stop scanner:', error)
				);
		}
		setIsScanning(false);


		// Check if the scanned text is a valid URL (?)
		try {
			const url = new URL(decodedText);
			window.location.href = url.href;
		} catch (error) {
			alert('Invalid QR Code. Please scan a valid link.');
		}
	};



	// Function to handle QR code scan failure
	const onScanFailure = (error: string) => {
		console.warn(`QR Code scan error: ${error}`);
	};

	// Function to handle referral code submission
	const handleStartSurvey = async () => {
		if (!referralCode.trim()) {
			alert('Please enter a referral code.');
			return;
		}

		setLoading(true);

		try {
			const response = await fetch(
				`/api/surveys/validate-ref/${referralCode}`
			);
			const data = await response.json();

			if (!response.ok) {
				alert(
					data.message ||
					'Invalid or already used referral code. Please try again.'
				);
				setLoading(false);
				return;
			}

			navigate('/survey', { state: { referralCode } });
		} catch (error) {
			console.error('Error validating referral code:', error);
			alert('Server error. Please try again.');
		} finally {
			setLoading(false);
		}
	};

	// Function to handle cancel button click
	return (
		<div className="apply-referral-page">
			<Header onLogout={onLogout} />
			<div className="apply-referral-container">
				<h2>Apply Referral Code</h2>
				<p>Enter or scan a QR code to start a new survey.</p>

				<input
					type="text"
					placeholder="Enter referral code..."
					value={referralCode}
					onChange={e =>
						setReferralCode(e.target.value.toUpperCase())
					}
					className="referral-input"
				/>

				{/* Start Survey Button */}
				<button
					className="generate-btn"
					onClick={handleStartSurvey}
					disabled={loading}
				>
					{loading ? 'Checking...' : 'Start Survey with Referral'}
				</button>

				{/* QR Code Scanner Button */}
				<button
					className="generate-btn"
					onClick={() => setIsScanning(!isScanning)}
					disabled={loading}
				>
					{isScanning ? 'Stop Scanning' : 'Scan QR Code with Camera'}
				</button>

				<div
					onClick={() => navigate('/survey')}
					className="new-seed-btn"
				>
					No referral code? Start new seed
				</div>

				{/* QR Code Scanner Container (Only shows when scanning) */}
				{isScanning && (
					<div
						ref={readerRef}
						id="qr-reader"
						style={{ width: '300px', margin: '10px auto' }}
					></div>
				)}

				{/* Cancel Button */}
				<button
					className="generate-btn cancel-btn"
					onClick={() => navigate('/dashboard')}
					disabled={loading}
				>
					Cancel
				</button>
			</div>
		</div>
	);
}
